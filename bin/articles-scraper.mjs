#!/usr/bin/env node

import { exec } from "child_process";
import { createWriteStream } from "fs";
import { mkdir, rm, writeFile } from "fs/promises";
import { HttpsProxyAgent } from "https-proxy-agent";
import { JSDOM } from "jsdom";
import fetch from "node-fetch";
import { dirname, join, normalize, resolve } from "path";
import { format, resolveConfig } from "prettier";
import { pipeline } from "stream/promises";
import { fileURLToPath } from "url";
import { promisify } from "util";

const execAsync = promisify(exec);

const ARTICLES_CMS_BASE_URL = process.env.ARTICLES_CMS_BASE_URL;
const ARTICLES_CMS_USERNAME = process.env.ARTICLES_CMS_USERNAME;
const ARTICLES_CMS_PASSWORD = process.env.ARTICLES_CMS_PASSWORD;

const ARTICLES_S3_GATEWAY_BASE_PATH = "/_cartes_s3_gateway/articles";
const ARTICLES_SITE_BASE_PATH = "/actualites";

const RCLONE_S3_REMOTE = "cartes_s3";
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const OUTPUT_DIR = resolve(join(__dirname, "..", "var", "data", "articles"));

const HTTP_PROXY = process.env.HTTP_PROXY;

const { log, warn, error } = console;

/**
 * Binary to ASCII
 * @param {string} username
 * @param {string} password
 */
const btoa = (username, password) => Buffer.from(username + ":" + password, "binary").toString("base64");

async function ensureDirectoryExists(filePath) {
    const dir = dirname(filePath);
    try {
        await mkdir(dir, { recursive: true });
    } catch (err) {
        error("An error occurred while creating the directory: ", err);
        throw err;
    }
}

const getArrayRange = (start, stop, step = 1) => Array.from({ length: (stop - start) / step + 1 }, (_, index) => start + index * step);

/**
 * Supprimer les éléments avec les classes spécifiées
 *
 * @param {HTMLElement} document
 * @param {string[]} classes
 */
const removeElementsWithClasses = (document, classes = []) => {
    const elements = classes.map((cls) => [...document.querySelectorAll(`.${cls}`)]).flat();
    elements.forEach((el) => el.remove());
};

/**
 * Télécharger les img et réécrire l'URL des img
 *
 * @param {HTMLElement} document
 */
const downloadAllImages = async (document) => {
    const imgList = [...document.querySelectorAll("img")];
    await Promise.all(
        imgList.map(async (img) => {
            // src
            const newSrc = await downloadFile(img.src);
            img.src = ARTICLES_S3_GATEWAY_BASE_PATH + newSrc.replace(OUTPUT_DIR, "");

            // srcset
            if (img.srcset && img.srcset.length > 0) {
                const srcSet = img.srcset.split(", ");

                const newSrcSet = await Promise.all(
                    srcSet.map(async (src) => {
                        // split pour séparer l'URL et le descriptor, voir : https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#srcset
                        const srcSplit = src.split(" ");
                        const originalImgPath = srcSplit?.[0] ?? src;
                        const descriptor = srcSplit?.[1] ?? null;

                        const newSrc = await downloadFile(originalImgPath);

                        // reconstitution de l'URL
                        return ARTICLES_S3_GATEWAY_BASE_PATH + newSrc.replace(OUTPUT_DIR, "") + (descriptor !== null ? " " + descriptor : "");
                    })
                );

                const newSrcSetString = newSrcSet.join(", ");
                img.srcset = newSrcSetString;
            }
        })
    );
};

/**
 * Télécharger tous les fichiers téléchargeables (pdf etc.) et réécrire les URLs
 *
 * @param {HTMLElement} document
 */
const downloadAllDownloadableFiles = async (document) => {
    const downloadLinks = [...document.querySelectorAll("a.fr-link--download")];
    await Promise.all(
        downloadLinks.map(async (downLink) => {
            try {
                const newUrl = await downloadFile(downLink.href);
                downLink.href = ARTICLES_S3_GATEWAY_BASE_PATH + newUrl.replace(OUTPUT_DIR, "");
            } catch (err) {
                warn(`Failed to download file for link ${downLink.href}:`, err);
            }
        })
    );
};

/**
 *
 * @param {?string} originalImgPath
 */
const downloadFile = async (originalImgPath) => {
    const url = new URL(ARTICLES_CMS_BASE_URL + originalImgPath);
    let mediaPath = normalize(join(OUTPUT_DIR, "media", url.pathname.replace("/sites/default/files", "")));
    mediaPath = decodeURI(mediaPath);

    log(`Downloading file from ${url.href}`);
    const response = await fetch(url.href, getFetchOptions());

    if (response.status !== 200) {
        const msg = `File download failed (code: ${response.status}) : ${url.href}`;
        warn(msg);
        warn("XXXXXXXXXXXXXX content-type - ", response.headers.get("content-type"), url.href);
        return Promise.reject(msg);
    }

    await ensureDirectoryExists(mediaPath);

    await pipeline(response.body, createWriteStream(mediaPath));

    log(`File saved to ${mediaPath}`);
    return mediaPath;
};

const getFetchOptions = () => {
    const proxyUrl = HTTP_PROXY;
    const proxyAgent = new HttpsProxyAgent(proxyUrl);

    return {
        agent: proxyAgent,
        headers: {
            Authorization: `Basic ${btoa(ARTICLES_CMS_USERNAME, ARTICLES_CMS_PASSWORD)}`,
        },
    };
};

const prettify = async (string) => {
    const options = await resolveConfig(resolve(join(__dirname, "..", ".prettierrc")));
    return await format(string, {
        ...options,
        parser: "html",
    });
};

const syncS3 = async () => {
    await execAsync(`rclone sync ${OUTPUT_DIR} ${RCLONE_S3_REMOTE}:${S3_BUCKET_NAME}/articles`);
    log(`Synchronised ${OUTPUT_DIR} with S3`);
};

const cleanOutputDir = async () => {
    await rm(OUTPUT_DIR, { force: true, recursive: true });
    log(`Output dir ${OUTPUT_DIR} cleared`);
};

/**
 * Renvoie les numéros de page de début et de fin. La pagination commence à 0.
 */
const getPageNumbers = async () => {
    const response = await fetch(ARTICLES_CMS_BASE_URL, getFetchOptions());

    const content = await response.text();
    const { document } = new JSDOM(content).window;

    // Lecture du contenu du main
    const $main = document.querySelector("main");

    const firstPage = 0;
    let lastPage = 0;
    try {
        const $navPaginationUl = $main.querySelector("nav.fr-pagination>.fr-pagination__list");
        const navPagLastChild = $navPaginationUl.lastElementChild.querySelector("a");
        lastPage = new URL(ARTICLES_CMS_BASE_URL + navPagLastChild.href).searchParams.get("page");
    } catch (error) {
        // Si la pagination n'existe pas, on considère qu'il n'y a qu'une seule page
    }

    log(`First page : ${firstPage}, last page : ${lastPage}`);

    return {
        firstPage: parseInt(firstPage),
        lastPage: parseInt(lastPage),
    };
};

const processArticlesIndex = async (page = 0) => {
    const url = `${ARTICLES_CMS_BASE_URL}/?page=${page}`;
    log(`Fetching articles index from url ${url}`);
    const response = await fetch(url, getFetchOptions());

    const content = await response.text();
    const { document } = new JSDOM(content).window;

    // Lecture du contenu du main
    const $main = document.querySelector("main");

    removeElementsWithClasses($main, ["visually-hidden", "hidden", "js-hide"]);

    await downloadAllImages($main);

    // Réécrire l'URL des actus
    const articleLinks = [...$main.querySelectorAll(".fr-card__title>a[href^='/']")];
    const articleSlugsList = [];
    articleLinks.forEach((el) => {
        articleSlugsList.push(el.href.replace("/", ""));
        el.href = ARTICLES_SITE_BASE_PATH + el.href;
    });

    // Sauvegarde du HTML final dans un fichier
    let mainContent = $main.innerHTML;
    mainContent = await prettify(mainContent);
    const outputFilePath = join(OUTPUT_DIR, "list", `${page}.html`);

    await ensureDirectoryExists(outputFilePath);
    await writeFile(outputFilePath, mainContent, { flag: "w" });
    log(`Saved main HTML file to ${outputFilePath}`);

    // Retoune la liste des slugs des articles
    return articleSlugsList;
};

/**
 *
 * @param {string} slug
 */
const processSingleArticle = async (slug) => {
    const response = await fetch(`${ARTICLES_CMS_BASE_URL}/${slug}`, getFetchOptions());

    const content = await response.text();
    const { document } = new JSDOM(content).window;

    // Lecture du contenu du main
    const $article = document.querySelector("article");

    removeElementsWithClasses($article, ["visually-hidden", "hidden", "js-hide"]);

    await downloadAllImages($article);

    await downloadAllDownloadableFiles($article);

    /**
     * Réécrire l'URL des liens internes qui commencent par '/', sauf ceux qui commencent par '/_cartes_s3_gateway'
     * parce que ce sont des documents qu'on a téléchargés et mis sur le S3
     */
    const internalLinks = [...$article.querySelectorAll("a[href^='/']:not([href^='/_cartes_s3_gateway'])")];
    internalLinks.forEach((el) => {
        el.href = ARTICLES_SITE_BASE_PATH + el.href;
    });

    let articleContent = $article.innerHTML;
    articleContent = await prettify(articleContent);
    const outputFilePath = join(OUTPUT_DIR, `${slug}.html`);

    await ensureDirectoryExists(outputFilePath);
    await writeFile(outputFilePath, articleContent, { flag: "w" });
    log(`Saved article ${slug} HTML file to ${outputFilePath}`);
};

(async () => {
    await cleanOutputDir();

    log(`Fetching URL ${ARTICLES_CMS_BASE_URL}`);
    log(`With proxy ${HTTP_PROXY}`);

    // la liste paginée des articles
    const { firstPage, lastPage } = await getPageNumbers();
    const pagesRange = getArrayRange(firstPage, lastPage); // [0,1,2,3,...,n]
    const articleSlugsList = (await Promise.all(pagesRange.map((page) => processArticlesIndex(page)))).flat();

    // les articles individuels
    await Promise.all(articleSlugsList.map((slug) => processSingleArticle(slug)));

    await syncS3();

    if (process.env.APP_ENV === "prod") {
        await cleanOutputDir();
    }
})();

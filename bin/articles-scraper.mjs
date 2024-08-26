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

const ARTICLES_CMS_BASE_URL = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
const ARTICLES_CMS_USERNAME = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
const ARTICLES_CMS_PASSWORD = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";

const ARTICLES_S3_GATEWAY_BASE_PATH = "/_cartes_s3_gateway/articles";
const ARTICLES_SITE_BASE_PATH = "/actualites";

const RCLONE_S3_REMOTE = "cartes_s3";
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const OUTPUT_DIR = resolve(join(__dirname, "..", "var", "data", "articles"));

const HTTP_PROXY = process.env.HTTP_PROXY;

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
        console.error("An error occurred while creating the directory: ", err);
        throw err;
    }
}

/**
 * Supprimer les éléments avec la classe "visually-hidden"
 *
 * @param {HTMLElement} document
 */
const removeVisuallyHiddenElements = (document) => {
    const visuallyHiddenList = document.querySelectorAll(".visually-hidden");
    visuallyHiddenList.forEach((el) => el.remove());
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
            const newSrc = await downloadImage(img.src);
            img.src = ARTICLES_S3_GATEWAY_BASE_PATH + newSrc.replace(OUTPUT_DIR, "");

            // srcset
            if (img.srcset && img.srcset.length > 0) {
                const srcSet = img.srcset.split(", ");

                const newSrcSet = await Promise.all(
                    srcSet.map(async (src) => {
                        const newSrc = await downloadImage(src);
                        return ARTICLES_S3_GATEWAY_BASE_PATH + newSrc.replace(OUTPUT_DIR, "");
                    })
                );

                const newSrcSetString = newSrcSet.join(", ");
                img.srcset = newSrcSetString;
            }
        })
    );
};

/**
 *
 * @param {string} originalImgPath
 */
const downloadImage = async (originalImgPath) => {
    const url = new URL(ARTICLES_CMS_BASE_URL + originalImgPath);
    let mediaPath = normalize(join(OUTPUT_DIR, "media", url.pathname.replace("/sites/default/files", "")));
    mediaPath = decodeURI(mediaPath);

    console.log(`Downloading file from ${url.href}`);
    const response = await fetch(url.href, {
        ...getFetchOptions(),
    });

    await ensureDirectoryExists(mediaPath);

    await pipeline(response.body, createWriteStream(mediaPath));

    console.log(`File saved to ${mediaPath}`);
    return mediaPath;
};

const getFetchOptions = () => {
    const proxyUrl = process.env.HTTP_PROXY;
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
    console.log(`Synchronised ${OUTPUT_DIR} with S3`);
};

const cleanOutputDir = async () => {
    await rm(OUTPUT_DIR, { force: true, recursive: true });
    console.log(`Output dir ${OUTPUT_DIR} cleared`);
};

const processArticlesIndex = async () => {
    const response = await fetch(ARTICLES_CMS_BASE_URL, {
        ...getFetchOptions(),
    });

    const content = await response.text();
    const { document } = new JSDOM(content).window;

    // Lecture du contenu du main
    const $main = document.querySelector("main");

    removeVisuallyHiddenElements($main);

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
    const outputFilePath = join(OUTPUT_DIR, "articles.html");

    await ensureDirectoryExists(outputFilePath);
    await writeFile(outputFilePath, mainContent, { flag: "w" });
    console.log(`Saved main HTML file to ${outputFilePath}`);

    // Retoune la liste des slugs des articles
    return articleSlugsList;
};

/**
 *
 * @param {string} slug
 */
const processSingleArticle = async (slug) => {
    const response = await fetch(`${ARTICLES_CMS_BASE_URL}/${slug}`, {
        ...getFetchOptions(),
    });

    const content = await response.text();
    const { document } = new JSDOM(content).window;

    // Lecture du contenu du main
    const $article = document.querySelector("article");

    removeVisuallyHiddenElements($article);

    await downloadAllImages($article);

    // Réécrire l'URL des liens internes (qui commencent par '/')
    const internalLinks = [...$article.querySelectorAll("a[href^='/']")];
    internalLinks.forEach((el) => {
        el.href = ARTICLES_SITE_BASE_PATH + el.href;
    });

    let articleContent = $article.innerHTML;
    articleContent = await prettify(articleContent);
    const outputFilePath = join(OUTPUT_DIR, `${slug}.html`);

    await ensureDirectoryExists(outputFilePath);
    await writeFile(outputFilePath, articleContent, { flag: "w" });
    console.log(`Saved article ${slug} HTML file to ${outputFilePath}`);
};

(async () => {
    await cleanOutputDir();

    console.log(`Fetching URL ${ARTICLES_CMS_BASE_URL}`);
    console.log(`With proxy ${HTTP_PROXY}`);

    const articleSlugsList = await processArticlesIndex();

    await Promise.all(articleSlugsList.map((slug) => processSingleArticle(slug)));

    await syncS3();

    if (process.env.APP_ENV === "prod") {
        await cleanOutputDir();
    }
})();

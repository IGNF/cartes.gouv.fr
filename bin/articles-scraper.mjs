#!/usr/bin/env node

import { exec } from "child_process";
import { createWriteStream } from "fs";
import { mkdir, readFile, rm, writeFile } from "fs/promises";
import { HttpsProxyAgent } from "https-proxy-agent";
import { JSDOM } from "jsdom";
import fetch from "node-fetch";
import { styleText, format as utilFormat } from "node:util";
import { dirname, join, normalize, resolve } from "path";
import { format, resolveConfig } from "prettier";
import { pipeline } from "stream/promises";
import { fileURLToPath } from "url";
import { promisify } from "util";

const execAsync = promisify(exec);

const ARTICLES_CMS_BASE_URL = process.env.ARTICLES_CMS_BASE_URL;
const ARTICLES_CMS_USERNAME = process.env.ARTICLES_CMS_USERNAME;
const ARTICLES_CMS_PASSWORD = process.env.ARTICLES_CMS_PASSWORD;

const ARTICLES_S3_GATEWAY_PATH_BASE = "/files";
const ARTICLES_S3_GATEWAY_PATH_ARTICLES = join(ARTICLES_S3_GATEWAY_PATH_BASE, "/articles");

const ARTICLES_SITE_PATH_BASE = "/actualites";
const ARTICLES_SITE_PATH_TAGS = "/actualites/liste";

const RCLONE_S3_REMOTE = "cartes_s3";
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const OUTPUT_DIR = resolve(join(__dirname, "..", "var", "data", "articles"));
const RUN_HISTORY_FILE = resolve(join(__dirname, "..", "var", "data", "articles-scraper-cronjob-history.json"));
const RUN_HISTORY_REMOTE_FILE = `${RCLONE_S3_REMOTE}:${S3_BUCKET_NAME}/articles/articles-scraper-cronjob-history.json`;
const MAX_HISTORY_ENTRIES = 10;

const HTTP_PROXY = process.env.HTTP_PROXY;

const formatArgs = (args) => (args.length === 1 ? String(args[0]) : utilFormat(...args));

const logger = {
    log: console.log,
    info: (...args) => console.info(styleText("bgBlue", formatArgs(args))),
    warn: (...args) => console.warn(styleText("bgYellow", formatArgs(args))),
    error: (...args) => console.error(styleText("bgRed", formatArgs(args))),
    success: (...args) => console.log(styleText("bgGreen", formatArgs(args))),
};

const stats = {
    articles: {
        detected: 0,
        downloaded: 0,
        failed: 0,
    },
    files: {
        downloaded: 0,
        failed: 0,
    }
}

const CONCURRENCY_LIMIT = 1;
const CONCURRENCY_DELAY = 200;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

/**
 * @param {Function} fn
 * @param {Object} options.maxRetries
 * @param {Object} options.retryDelay
 * @returns {Promise<any>}
 */
const withRetry = async (fn, options = {}) => {
    const { maxRetries = MAX_RETRIES, retryDelay = RETRY_DELAY } = options;
    let lastError;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            const delay = retryDelay * Math.pow(2, attempt);
            logger.warn(`Attempt ${attempt + 1}/${maxRetries} failed. Retrying in ${delay}ms...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }

    throw lastError;
};

/**
 * Effectue une opération asynchrone sur chaque élément d'un tableau avec une limite de concurrence, avec une option de délai entre les opérations
 *
 * @param {Array} items
 * @param {Function} fn
 * @param {number} options.concurrency
 * @param {number} options.delay
 * @returns {Promise<Array>}
 */
const withConcurrency = async (items, fn, options = {}) => {
    const { concurrency = CONCURRENCY_LIMIT, delay = CONCURRENCY_DELAY } = options;

    const results = [];
    const pending = new Set();

    for (const item of items) {
        if (delay > 0 && results.length > 0) {
            await new Promise((resolve) => setTimeout(resolve, delay));
        }

        const promise = (async () => {
            try {
                return await fn(item);
            } finally {
                pending.delete(promise);
            }
        })();

        pending.add(promise);
        results.push(promise);

        if (pending.size >= concurrency) {
            await Promise.race(pending);
        }
    }

    return Promise.all(results);
};

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
        logger.error("An error occurred while creating the directory: ", err);
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
    const elements = classes.map((cls) => [...(document?.querySelectorAll(`.${cls}`) ?? [])]).flat();
    elements.forEach((el) => el.remove());
};

/**
 * @param {HTMLElement} el
 */
const removeElementKeepChildren = (el) => {
    if (el && el.parentNode) {
        // Insérer tous les enfants de l'élément avant l'élément lui-même
        while (el.firstChild) {
            el.parentNode.insertBefore(el.firstChild, el);
        }
        // Supprimer l'élément original
        el.parentNode.removeChild(el);
    }
};

/**
 * Supprimer les éléments avec les classes spécifiées sans supprimer les enfants
 *
 * @param {HTMLElement} document
 * @param {string[]} classes
 */
const removeElementsWithClassesKeepChildren = (document, classes = []) => {
    const elements = classes.map((cls) => [...(document?.querySelectorAll(`.${cls}`) ?? [])]).flat();
    elements.forEach((el) => removeElementKeepChildren(el));
};

/**
 * Télécharger les img et réécrire l'URL des img
 *
 * @param {HTMLElement} document
 */
const downloadAllImages = async (document) => {
    const imgList = [...(document?.querySelectorAll("img") ?? [])];
    await withConcurrency(imgList, async (img) => {
        // src
        const newSrc = await downloadFile(img.src);
        img.src = ARTICLES_S3_GATEWAY_PATH_ARTICLES + newSrc.replace(OUTPUT_DIR, "");

        // srcset
        if (img.srcset && img.srcset.length > 0) {
            const srcSet = img.srcset.split(", ");

            const newSrcSet = await withConcurrency(srcSet, async (src) => {
                // split pour séparer l'URL et le descriptor, voir : https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#srcset
                const [originalImgPath, descriptor] = src.split(" ");

                const newSrc = await downloadFile(originalImgPath);

                // reconstitution de l'URL
                return ARTICLES_S3_GATEWAY_PATH_ARTICLES + newSrc.replace(OUTPUT_DIR, "") + (descriptor !== null ? " " + descriptor : "");
            });

            const newSrcSetString = newSrcSet.join(", ");
            img.srcset = newSrcSetString;
        }
    });
};

/**
 * Télécharger tous les fichiers téléchargeables (pdf etc.) et réécrire les URLs
 *
 * @param {HTMLElement} document
 */
const downloadAllDownloadableFiles = async (document) => {
    const downloadLinks = [...(document?.querySelectorAll("a.fr-link--download") ?? [])];
    await withConcurrency(downloadLinks, async (downLink) => {
        try {
            const newUrl = await downloadFile(downLink.href);
            downLink.href = ARTICLES_S3_GATEWAY_PATH_ARTICLES + newUrl.replace(OUTPUT_DIR, "");
        } catch (_) {
            downLink.removeAttribute("href");
        }
    });
};

/**
 *
 * @param {string} originalFilePath
 */
const downloadFile = async (originalFilePath) => {
    const url = new URL(ARTICLES_CMS_BASE_URL + originalFilePath);
    let newFilePath = normalize(join(OUTPUT_DIR, "media", url.pathname.replace("/sites/default/files", "")));
    newFilePath = decodeURI(newFilePath);

    logger.log(`Downloading file from ${url.href}`);

    const response = await withRetry(async () => {
        const res = await fetch(url.href, getFetchOptions());
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return res;
    });

    try {
        await ensureDirectoryExists(newFilePath);
        await pipeline(response.body, createWriteStream(newFilePath));

        logger.log(`File saved to ${newFilePath}`);
        stats.files.downloaded++;
        return newFilePath;
    } catch (error) {
        logger.error(`Failed to download ${url.href}: ${error.message}`);
        stats.files.failed++;
        throw error;
    }
};

const getFetchOptions = () => {
    const options = {};

    if (HTTP_PROXY) {
        options.agent = new HttpsProxyAgent(HTTP_PROXY);
    }

    if (ARTICLES_CMS_USERNAME && ARTICLES_CMS_PASSWORD) {
        options.headers = {
            ...options?.headers,
            Authorization: `Basic ${btoa(ARTICLES_CMS_USERNAME, ARTICLES_CMS_PASSWORD)}`,
        };
    }

    return options;
};

const prettify = async (string) => {
    const options = await resolveConfig(resolve(join(__dirname, "..", ".prettierrc")));
    return await format(string, {
        ...options,
        parser: "html",
    });
};

const readHistory = async () => {
    try {
        const historyContent = await readFile(RUN_HISTORY_FILE, "utf8");
        const parsedHistory = JSON.parse(historyContent);

        if (Array.isArray(parsedHistory?.runs)) {
            return parsedHistory;
        }
    } catch (error) {
        if (error?.code !== "ENOENT") {
            logger.warn(`Unable to read ${RUN_HISTORY_FILE}, recreating history file.`);
        }
    }

    return {
        runs: [],
    };
};

const appendRunHistory = async (entry) => {
    const history = await readHistory();
    history.runs.unshift(entry);
    history.runs = history.runs.slice(-MAX_HISTORY_ENTRIES);

    await ensureDirectoryExists(RUN_HISTORY_FILE);
    await writeFile(RUN_HISTORY_FILE, JSON.stringify(history, null, 2), { flag: "w" });
};

const isHistoryMissingOnRemote = (error) => {
    const stderr = String(error?.stderr ?? "");
    return /not found|no such file|object does not exist|failed to copy/i.test(stderr);
};

const pullHistoryFromS3 = async () => {
    const command = `rclone copyto ${RUN_HISTORY_REMOTE_FILE} ${RUN_HISTORY_FILE}`;

    try {
        await execAsync(command);
        logger.info(`Pulled history file from ${RUN_HISTORY_REMOTE_FILE}`);

        return {
            command,
            exitCode: 0,
        };
    } catch (error) {
        if (isHistoryMissingOnRemote(error)) {
            logger.info(`No history file found on ${RUN_HISTORY_REMOTE_FILE}, starting with local empty history.`);
            return {
                command,
                exitCode: Number.isInteger(error?.code) ? error.code : 1,
            };
        }

        logger.warn(`Failed to pull history from ${RUN_HISTORY_REMOTE_FILE}, continuing with local fallback.`);
        return {
            command,
            exitCode: Number.isInteger(error?.code) ? error.code : 1,
        };
    }
};

const pushHistoryToS3 = async () => {
    const command = `rclone copyto ${RUN_HISTORY_FILE} ${RUN_HISTORY_REMOTE_FILE}`;

    try {
        await execAsync(command);
        logger.info(`Pushed history file to ${RUN_HISTORY_REMOTE_FILE}`);

        return {
            command,
            exitCode: 0,
        };
    } catch (error) {
        logger.error(`Failed to push history file to ${RUN_HISTORY_REMOTE_FILE}`);

        return {
            command,
            exitCode: Number.isInteger(error?.code) ? error.code : 1,
        };
    }
};

const syncS3 = async () => {
    const command = `rclone sync ${OUTPUT_DIR} ${RCLONE_S3_REMOTE}:${S3_BUCKET_NAME}/articles`;

    try {
        await execAsync(command);
        logger.info(`Synchronised ${OUTPUT_DIR} to ${RCLONE_S3_REMOTE}:${S3_BUCKET_NAME}/articles`);

        return {
            command,
            exitCode: 0,
        };
    } catch (error) {
        logger.error(`Sync failed for command: ${command}`);

        return {
            command,
            exitCode: Number.isInteger(error?.code) ? error.code : 1,
        };
    }
};

const cleanOutputDir = async () => {
    await rm(OUTPUT_DIR, { force: true, recursive: true });
    logger.info(`Output dir ${OUTPUT_DIR} cleared`);
};

/**
 * Renvoie les numéros de page de début et de fin. La pagination commence à 0.
 */
const getPageNumbers = async (url) => {
    const response = await fetch(url, getFetchOptions());

    const content = await response.text();
    const { document } = new JSDOM(content).window;

    // Lecture du contenu du main
    const $main = document.querySelector("main");

    const firstPage = 0;
    let lastPage = 0;
    try {
        const $navPaginationUl = $main.querySelector("nav.fr-pagination>.fr-pagination__list");
        const navPagLastChild = $navPaginationUl.lastElementChild.querySelector("a");
        lastPage = new URL(url + navPagLastChild.href).searchParams.get("page");
    } catch (_) {
        // Si la pagination n'existe pas, on considère qu'il n'y a qu'une seule page
    }

    logger.info(`First page: ${firstPage}, last page: ${lastPage}`);

    return {
        firstPage: parseInt(firstPage),
        lastPage: parseInt(lastPage),
    };
};

const processTagsInDocument = async (document) => {
    const $tagsGroup = document?.querySelector("ul.fr-tags-group");
    const $tagsList = [...($tagsGroup?.querySelectorAll("a.fr-tag") ?? [])];

    const tags = [];
    $tagsList.forEach((el) => {
        tags.push({
            tag: el.href.split("/").pop(), // le tag est la dernière partie de l'URL,
            originalUrl: el.href,
        });

        el.href = join(ARTICLES_SITE_PATH_TAGS, el.href.split("/")?.[5] ?? "");
    });

    return tags;
};

const processArticlesIndex = async (baseUrl, page = 0, outputSubDir = "list") => {
    const url = `${baseUrl}/?page=${page}`;
    logger.log(`Fetching articles index from url ${url}`);
    const response = await fetch(url, getFetchOptions());

    const content = await response.text();
    const { document } = new JSDOM(content).window;

    // Lecture du contenu du main
    const $main = document.querySelector("main");

    removeElementsWithClasses($main, ["visually-hidden", "hidden", "js-hide"]);
    removeElementsWithClassesKeepChildren($main, ["fr-container"]);

    await downloadAllImages($main);

    // Réécrire l'URL des actus
    const articleLinks = [...($main?.querySelectorAll(".fr-card__title>a[href^='/']") ?? [])];
    const articleSlugsList = [];
    articleLinks.forEach((el) => {
        articleSlugsList.push(el.href.replace("/", ""));
        el.href = ARTICLES_SITE_PATH_BASE + el.href;
    });

    // Réécrire l'URL des pages de tags
    processTagsInDocument($main);

    // Sauvegarde du HTML final dans un fichier
    let mainContent = $main?.innerHTML ?? "";
    mainContent = await prettify(mainContent);
    const outputFilePath = join(OUTPUT_DIR, outputSubDir, `${page}.html`);

    await ensureDirectoryExists(outputFilePath);
    await writeFile(outputFilePath, mainContent, { flag: "w" });
    logger.log(`Saved articles index HTML file to ${outputFilePath}`);

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
     * Réécrire l'URL des liens internes qui commencent par '/', sauf ceux qui commencent par ARTICLES_S3_GATEWAY_PATH_BASE
     * parce que ce sont des documents qu'on a téléchargés et mis sur le S3
     */
    const internalLinks = [...($article?.querySelectorAll(`a[href^='/']:not([href^='${ARTICLES_S3_GATEWAY_PATH_BASE}'])`) ?? [])];
    internalLinks.forEach((el) => {
        el.href = ARTICLES_SITE_PATH_BASE + el.href;
    });

    let articleContent = $article?.innerHTML ?? "";
    articleContent = await prettify(articleContent);
    const outputFilePath = join(OUTPUT_DIR, `${slug}.html`);

    await ensureDirectoryExists(outputFilePath);
    await writeFile(outputFilePath, articleContent, { flag: "w" });
    logger.log(`Saved article ${slug} HTML file to ${outputFilePath}`);
};

(async () => {
    const executedAt = new Date();
    let didScrapeFail = false;

    await pullHistoryFromS3();

    try {
        await cleanOutputDir();

        logger.info(`Fetching URL ${ARTICLES_CMS_BASE_URL}`);
        logger.info(`With proxy ${HTTP_PROXY}`);

        // la liste paginée des articles (index général)
        const { firstPage, lastPage } = await getPageNumbers(ARTICLES_CMS_BASE_URL);
        const pagesRange = getArrayRange(firstPage, lastPage); // [0,1,2,3,...,n]
        const articleSlugsList = (await withConcurrency(pagesRange, (page) => processArticlesIndex(ARTICLES_CMS_BASE_URL, page))).flat();
        stats.articles.detected = articleSlugsList.length;

        //  la liste paginée des articles par tag (index pour chaque tag)
        const response = await fetch(ARTICLES_CMS_BASE_URL, getFetchOptions());

        const content = await response.text();
        const { document } = new JSDOM(content).window;

        const tags = await processTagsInDocument(document);

        await withConcurrency(tags, async (tag) => {
            const { firstPage, lastPage } = await getPageNumbers(ARTICLES_CMS_BASE_URL);
            const pagesRange = getArrayRange(firstPage, lastPage); // [0,1,2,3,...,n]
            await withConcurrency(pagesRange, (page) => processArticlesIndex(tag.originalUrl, page, "list/tags/" + tag.tag));
        });

        // les articles individuels
        await withConcurrency(articleSlugsList, async (slug) => {
            try {
                await processSingleArticle(slug);
                stats.articles.downloaded++;
            } catch (error) {
                stats.articles.failed++;
                logger.warn(`Failed to process article ${slug}: ${error?.message ?? "unknown error"}`);
            }
        });

        if (stats.articles.failed > 0) {
            logger.warn(`Failed to download ${stats.articles.failed} article(s).`);
        }

        logger.info(`Downloaded ${stats.files.downloaded} file(s) successfully.`);
        if (stats.files.failed > 0) {
            logger.warn(`Failed to download ${stats.files.failed} file(s).`);
        } else {
            logger.success("All files downloaded successfully.");
        }
    } catch (error) {
        didScrapeFail = true;
        logger.error("Script failed:", error);
    }

    const syncResult = await syncS3();
    if (syncResult.exitCode !== 0) {
        didScrapeFail = true;
    }

    await appendRunHistory({
        executedAt: executedAt.toISOString(),
        durationMs: new Date().getTime() - executedAt.getTime(),
        stats
    });

    const historyPushResult = await pushHistoryToS3();
    if (historyPushResult.exitCode !== 0) {
        logger.warn("History file sync to S3 failed after local update.");
        didScrapeFail = true;
    }

    if (process.env.APP_ENV === "prod") {
        await cleanOutputDir();
    }

    if (didScrapeFail) {
        process.exitCode = 1;
    }
})();

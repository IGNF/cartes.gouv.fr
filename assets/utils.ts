import { format as datefnsFormat } from "date-fns-tz";
import { fr } from "date-fns/locale";

// Themes et mot cles INSPIRE
import inspireKeywords from "./data/thematic-inspire.json";

// charsets
import charsets from "./data/charset_list.json";

// Langues iso639-2
// https://github.com/haliaeetus/iso-639/blob/master/data/iso_639-2.json
import langs from "./data/iso_639-2.json";
import { OfferingTypeEnum } from "./@types/app";

export type LanguageType = {
    language: string;
    code: string;
};
const getLanguages = (): LanguageType[] => {
    const languages: LanguageType[] = [];
    for (const def of Object.values(langs)) {
        const code = def["639-2"];
        if (code !== "und") {
            // Cas special pour le francais, le geocatalogue ne connait que "fre"
            languages.push({ language: def.fr[0], code: code === "fra" ? "fre" : code });
        }
    }

    // Supression des doublons
    const nodoubles = [...new Map(languages.map((item) => [item["code"], item])).values()];
    return nodoubles;
};

const getInspireKeywords = () => {
    // récupérer et applatir tous les sous-tableaux
    const flat = Object.values(inspireKeywords).flat();
    // retourner uniquement les valeurs uniques
    return Array.from(new Set(flat));
};

/**
 * Supprime les accents d'une chaine de caracteres
 * œ => OE et æ => AE
 */
const removeDiacritics = (str) => {
    const removeLigature = (s) => {
        return s
            .replace(/\u0152/g, "OE")
            .replace(/\u0153/g, "oe")
            .replace(/\u00c6/g, "AE")
            .replace(/\u00e6/g, "ae");
    };

    if (typeof str === "string" || str instanceof String) {
        let s = str.normalize("NFD");
        s = removeLigature(s);
        return s.replace(/[\u0300-\u036f]/g, "");
    }
    return str;
};

/**
 * Recupere les informations d'une requete
 */
const getRequestInfo = (url: string): Record<string, string> => {
    const _url = new URL(url);
    const params = Object.fromEntries(_url.searchParams);
    return { ...params, base_url: `${_url.origin}${_url.pathname}` };
};

/**
 * Convertit des octets en KB, MB ...
 */
const niceBytes = (x: string) => {
    const units = ["bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    let l = 0,
        n = parseInt(x, 10) || 0;
    while (n >= 1024 && ++l) {
        n = n / 1024;
    }

    return n.toFixed(n < 10 && l > 0 ? 2 : 0) + " " + units[l];
};

const regex = {
    // /^(?=.{1,99}$)[a-zA-Z0-9À-ÿ\-._~!$&'()*+,;:@%\s]+$/g
    datasheet_name: /^[\wÀ-ÿ\-._~!$&'()*+,;:@%\s]+$/g, // alphanumérique avec accents, certains caractères spéciaux, espaces blancs
    // file_identifier: /^[\wÀ-ÿ\-._~!$&'()*+,;:@%]+$/g, // alphanumérique avec accents, certains caractères spéciaux
    file_identifier: /^[\w-.]+$/g, // alphanumérique sans accents, certains caractères spéciaux
    technical_name: /^[\w-.]+$/,
    email: /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/,
    uuid: /^[A-F\d]{8}-[A-F\d]{4}-[A-F\d]{4}-[A-F\d]{4}-[A-F\d]{12}$/i,
};

export type ContentRangeType = {
    first: number;
    last: number;
    total: number;
};

/**
 * Decode content-range des headers après une requête get de l'API
 * @param contentRange string
 * @returns
 */
const decodeContentRange = (contentRange: string): ContentRangeType => {
    const isInteger = (str: string): boolean => {
        if (typeof str !== "string") return false;
        return !isNaN(parseInt(str, 10));
    };

    if (contentRange === undefined) throw new Error("contentRange is undefined");

    const formatError = "contentRange format is not correct";

    let parts = contentRange.split("/");
    if (parts.length !== 2) throw new Error(formatError);
    if (!isInteger(parts[1])) throw new Error(formatError);

    const total = parseInt(parts[1], 10);

    parts = parts[0].split("-");
    if (parts.length !== 2) throw new Error(formatError);
    if (!isInteger(parts[0]) && !isInteger(parts[1])) throw new Error(formatError);

    return { first: parseInt(parts[0], 10), last: parseInt(parts[1], 10), total: total };
};

const offeringTypeDisplayName = (type: OfferingTypeEnum): string => {
    switch (type) {
        case OfferingTypeEnum.WMSVECTOR:
            return "Web Map Service Vecteur";
        case OfferingTypeEnum.WFS:
            return "Web Feature Service";
        case OfferingTypeEnum.WMTSTMS:
            return "Web Map Tile Service - Tile Map Service";
        case OfferingTypeEnum.WMSRASTER:
            return "Web Map Service Raster";
        case OfferingTypeEnum.DOWNLOAD:
            return "Service de Téléchargement";
        case OfferingTypeEnum.ITINERARYISOCURVE:
            return "Service de calcul d’itinéraire / isochrone";
        case OfferingTypeEnum.ALTIMETRY:
            return "Service d’altimétrie";
        default:
            return type;
    }
};

const getProjectionCode = (epsg?: string) => {
    if (!epsg) return null;
    const parts = epsg.split(":");
    if (parts.length === 2) {
        return parts[1];
    }
    return null;
};

const getFileExtension = (filename: string) => {
    if (!filename) return "";
    return filename.split(".").pop()?.toLowerCase();
};

const formatDateFromISO = (isoDateString: string): string => {
    const m = isoDateString.match(/([\d\-T:]+)\+\d{2}:\d{2}?/); // "2023-06-02T06:01:46+00:00"
    if (m) {
        isoDateString = m[1];
    }
    isoDateString = isoDateString.includes("Z") ? isoDateString : isoDateString + "Z";

    const d = new Date(isoDateString);

    return (
        datefnsFormat(d, "dd MMMM yyyy, HH", { locale: fr, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }) +
        "h" +
        datefnsFormat(d, "mm", { locale: fr, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone })
    );
};

const formatDateWithoutTimeFromISO = (isoDateString: string): string => {
    const m = isoDateString.match(/([\d\-T:]+)\+\d{2}:\d{2}?/); // "2023-06-02T06:01:46+00:00"
    if (m) {
        isoDateString = m[1];
    }
    isoDateString = isoDateString.includes("Z") ? isoDateString : isoDateString + "Z";

    const d = new Date(isoDateString);

    return datefnsFormat(d, "dd MMMM yyyy", { locale: fr, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });
};

const getArrayRange = (start: number, stop: number, step: number = 1): number[] =>
    Array.from({ length: (stop - start) / step + 1 }, (_, index) => start + index * step);

const trimObject = (obj: object): object => {
    if (typeof obj !== "object" || obj === null) {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map((elem) => {
            if (typeof elem === "string") {
                return elem.trim();
            }
            return trimObject(elem);
        });
    }

    const newObject = Object.keys(obj).reduce((acc, key) => {
        let value = obj[key];

        if (typeof value === "string") {
            value = value.trim();
        } else if (typeof value === "object") {
            value = trimObject(value);
        }
        return { ...acc, [key]: value };
    }, {});

    return newObject;
};

export {
    getInspireKeywords,
    getLanguages,
    charsets,
    removeDiacritics,
    regex,
    decodeContentRange,
    offeringTypeDisplayName,
    getRequestInfo,
    niceBytes,
    getProjectionCode,
    getFileExtension,
    formatDateFromISO,
    formatDateWithoutTimeFromISO,
    getArrayRange,
    trimObject,
};

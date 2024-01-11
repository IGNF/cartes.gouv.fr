// Themes et mot cles INSPIRE
import inspireKeywords from "./data/thematic-inspire.json";

// charsets
import charsets from "./data/charset_list.json";

// Langues iso639-2
// https://github.com/haliaeetus/iso-639/blob/master/data/iso_639-2.json
import langs from "./data/iso_639-2.json";
import { OfferingTypeEnum } from "./types/app";

export type LanguageType = {
    language: string;
    code: string;
};
const getLanguages = (): LanguageType[] => {
    const languages: LanguageType[] = [];
    for (const def of Object.values(langs)) {
        const code = def["639-2"];
        if (code !== "und") {
            languages.push({ language: def.fr[0], code: code });
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
    name_constraint: /^[\w-.]+$/,
    email: /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/,
    uuid: /^[A-Za-z\d]{8}-[A-Za-z\d]{4}-[A-Za-z\d]{4}-[A-Za-z\d]{4}-[A-Za-z\d]{12}$/,
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
            return "Service de calcul d'itinéraire / isochrone";
        case OfferingTypeEnum.ALTIMETRY:
            return "Service d'altimétrie";
        default:
            return type;
    }
};

export { charsets, decodeContentRange, getInspireKeywords, getLanguages, niceBytes, offeringTypeDisplayName, regex, removeDiacritics };

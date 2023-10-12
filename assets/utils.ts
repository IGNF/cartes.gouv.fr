// Themes et mot cles INSPIRE
import inspireKeywords from "./data/thematic-inspire.json";

// charsets
import charsets from "./data/charset_list.json";

// Langues iso639-2
// https://github.com/haliaeetus/iso-639/blob/master/data/iso_639-2.json
import langs from "./data/iso_639-2.json";

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

const regex = {
    name_constraint: /^[\w-.]+$/,
    email: /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/,
};

export { getInspireKeywords, getLanguages, charsets, removeDiacritics, regex };

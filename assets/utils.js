const languages = {
    "en_EN": "Anglais",
    "fr_FR": "Français"
};

const charsets = {
    "ISO-8859-1": "ISO-8859-1",
    "UTF-8": "UTF-8"
};

/**
 * Supprime les accents d'une chaine de caracteres
 * œ => OE et æ => AE
 */
const removeDiacritics = str => {
    const removeLigature = s => {
        return s.replace(/\u0152/g, "OE")
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

export { languages, charsets, removeDiacritics };
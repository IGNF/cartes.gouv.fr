import { format as datefnsFormat } from "date-fns-tz";
import { fr } from "date-fns/locale";

/**
 * Supprime les accents d'une chaine de caracteres
 * œ => OE et æ => AE
 */
export const removeDiacritics = (str) => {
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
export const niceBytes = (x: string) => {
    const units = ["bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    let l = 0,
        n = parseInt(x, 10) || 0;
    while (n >= 1024 && ++l) {
        n = n / 1024;
    }

    return n.toFixed(n < 10 && l > 0 ? 2 : 0) + " " + units[l];
};

export const formatDate = (date: Date): string => {
    return datefnsFormat(date, "dd MMMM yyyy", { locale: fr, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });
};

export const formatDateTime = (date: Date): string => {
    return (
        datefnsFormat(date, "dd MMMM yyyy, HH", { locale: fr, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }) +
        "h" +
        datefnsFormat(date, "mm", { locale: fr, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone })
    );
};

export const formatDateTimeLocal = (date: Date): string => {
    return datefnsFormat(date, "yyyy-MM-dd'T'HH:mm", { locale: fr, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });
};

export const formatDateFromISO = (isoDateString: string): string => {
    const m = isoDateString.match(/([\d\-T:]+)\+\d{2}:\d{2}?/); // "2023-06-02T06:01:46+00:00"
    if (m) {
        isoDateString = m[1];
    }
    isoDateString = isoDateString.includes("Z") ? isoDateString : isoDateString + "Z";

    const d = new Date(isoDateString);

    return formatDateTime(d);
};

export const formatDateWithoutTimeFromISO = (isoDateString: string): string => {
    const m = isoDateString.match(/([\d\-T:]+)\+\d{2}:\d{2}?/); // "2023-06-02T06:01:46+00:00"
    if (m) {
        isoDateString = m[1];
    }
    isoDateString = isoDateString.includes("Z") ? isoDateString : isoDateString + "Z";

    const d = new Date(isoDateString);

    return formatDate(d);
};

export const trimObject = (obj: object): object => {
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

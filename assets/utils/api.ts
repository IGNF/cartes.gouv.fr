/**
 * Recupere les informations d'une requete
 */
export const getRequestInfo = (url: string): Record<string, string> => {
    const _url = new URL(url);
    const params = Object.fromEntries(_url.searchParams);
    return { ...params, base_url: `${_url.origin}${_url.pathname}` };
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
export const decodeContentRange = (contentRange: string): ContentRangeType => {
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

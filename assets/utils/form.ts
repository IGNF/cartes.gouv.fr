// Pour des chaines non définies ou vides => null
export const setToNull = (value) => (value === undefined || value === "" ? null : value);

export const cloneFile = (original: File) =>
    new File([original], original.name, {
        type: original.type,
        lastModified: original.lastModified,
    });

// export const encodeKey = (key: string): string => {
//     return Buffer.from(key).toString("base64");
// };

// export const decodeKey = (encodedKey: string): string => {
//     return Buffer.from(encodedKey, "base64").toString();
// };

/**
 * Encode une chaîne en base64 pour que la clé ne contienne pas de caractères spéciaux qui peuvent poser des soucis à la "dot notation" de react-hook-form.
 */
export const encodeKey = (key: string): string => btoa(encodeURIComponent(key));

/**
 * Décode une chaîne encodée en base64.
 */
export const decodeKey = (encodedKey: string): string => decodeURIComponent(atob(encodedKey));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const encodeKeys = (obj: Record<string, any>): Record<string, any> =>
    Object.fromEntries(Object.entries(obj).map(([key, value]) => [encodeKey(key), value]));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const decodeKeys = (obj: Record<string, any>): Record<string, any> =>
    Object.fromEntries(Object.entries(obj).map(([key, value]) => [decodeKey(key), value]));

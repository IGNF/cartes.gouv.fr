export * from "./api";
export * from "./format";
export * from "./inspire";
export * from "./lang";
export * from "./map";
export * from "./offering";
export * from "./types";
export * from "./user";
export * from "./image";
export * from "./form";

// charsets
export { default as charsets } from "@/data/charset_list.json";

export const regex = {
    // /^(?=.{1,99}$)[a-zA-Z0-9À-ÿ\-._~!$&'()*+,;:@%\s]+$/g
    datasheet_name: /^[\wÀ-ÿ\-._~!$&'()*+,;:@%\s]+$/g, // alphanumérique avec accents, certains caractères spéciaux, espaces blancs
    // file_identifier: /^[\wÀ-ÿ\-._~!$&'()*+,;:@%]+$/g, // alphanumérique avec accents, certains caractères spéciaux
    file_identifier: /^[\w-.]+$/g, // alphanumérique sans accents, certains caractères spéciaux
    technical_name: /^[A-Za-z_][A-Za-z0-9_.-]*$/, // chaîne alphanumérique qui commence par une lettre ou un underscore et ne doit contenir que des lettres, chiffres, tirets (-), underscores (_), ou points (.)
    email: /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/,
    uuid: /^[A-F\d]{8}-[A-F\d]{4}-[A-F\d]{4}-[A-F\d]{4}-[A-F\d]{12}$/i,
    public_name: /^[A-Za-z_][A-Za-z0-9_.-]*$/,
};

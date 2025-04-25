import { declareComponentKeys } from "i18nifty";

import { Translations } from "../../../i18n/types";

const { i18n } = declareComponentKeys<"title" | "file_input_hint">()("UploadStyleFile");
export type I18n = typeof i18n;

export const UploadStyleFileFrTranslations: Translations<"fr">["UploadStyleFile"] = {
    title: "Déposez vos fichiers de style SLD",
    file_input_hint: "Glissez-déposez votre fichier SLD ici. Formats de fichiers autorisés : .sld",
};

export const UploadStyleFileEnTranslations: Translations<"en">["UploadStyleFile"] = {
    title: undefined,
    file_input_hint: undefined,
};

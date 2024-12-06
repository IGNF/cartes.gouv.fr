import { declareComponentKeys } from "i18nifty";
import { Translations } from "../../../i18n/types";

const { i18n } = declareComponentKeys<"metadata_not_defined" | "parsing_error" | "writing_error">()("TMSStyleFilesManager");
export type I18n = typeof i18n;

export const TMSStyleFilesManagerFrTranslations: Translations<"fr">["TMSStyleFilesManager"] = {
    metadata_not_defined: "tms_metadata n'est pas defini dans le service",
    parsing_error: "Erreur dans l’analyse du fichier",
    writing_error: "Erreur dans l’écriture du style mapbox",
};
export const TMSStyleFilesManagerEnTranslations: Translations<"en">["TMSStyleFilesManager"] = {
    metadata_not_defined: "tms_metadata is not defined in service",
    parsing_error: "File parsing error",
    writing_error: "Writing mapbox style error",
};

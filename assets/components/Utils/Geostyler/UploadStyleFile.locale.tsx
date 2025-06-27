import { declareComponentKeys } from "i18nifty";

import { Translations } from "../../../i18n/types";

const { i18n } = declareComponentKeys<
    | "layers"
    | "style_overview"
    | "file_input_title"
    | "file_input_hint"
    | "or"
    | "create_style"
    | "remove_style"
    | { K: "remove_style_confirm_message"; P: { layer: string }; R: string }
>()("UploadStyleFile");
export type I18n = typeof i18n;

export const UploadStyleFileFrTranslations: Translations<"fr">["UploadStyleFile"] = {
    layers: "Couches",
    style_overview: "Aperçu du style",
    file_input_title: "Ajouter un fichier de style",
    file_input_hint: "Glissez-déposez votre fichier SLD ici. Formats de fichiers autorisés : .sld",
    or: "OU",
    create_style: "Créer un style",
    remove_style: "Supprimer le style",
    remove_style_confirm_message: ({ layer }) => `Êtes-vous sûr de vouloir supprimer le style de la couche [${layer}] et en recréer un autre ?`,
};

export const UploadStyleFileEnTranslations: Translations<"en">["UploadStyleFile"] = {
    layers: "Layers",
    style_overview: "Style overview",
    file_input_title: undefined,
    file_input_hint: undefined,
    or: "OR",
    create_style: "Create style",
    remove_style: "Remove style",
    remove_style_confirm_message: ({ layer }) => `Are you sure to remove layer ${layer} style ?`,
};

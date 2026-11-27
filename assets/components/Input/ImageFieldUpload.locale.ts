import { declareComponentKeys } from "@/i18n/i18n";
import { Translations } from "@/i18n/types";

const { i18n } = declareComponentKeys<"edit" | "delete">()("ImageFieldUpload");
export type I18n = typeof i18n;

export const ImageFieldUploadFrTranslations: Translations<"fr">["ImageFieldUpload"] = {
    edit: "Modifier l’image",
    delete: "Supprimer l’image",
};

export const ImageFieldUploadEnTranslations: Translations<"en">["ImageFieldUpload"] = {
    edit: "Edit image",
    delete: "Delete image",
};

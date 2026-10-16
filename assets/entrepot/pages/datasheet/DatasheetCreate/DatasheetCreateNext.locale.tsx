import { declareComponentKeys } from "@/i18n";
import { type Translations } from "@/i18n/types";

const { i18n } = declareComponentKeys<"title" | "cancel" | "submit">()("DatasheetCreateNext");

export type I18n = typeof i18n;

export const DatasheetCreateNextFrTranslations: Translations<"fr">["DatasheetCreateNext"] = {
    title: "Créer une fiche de données",
    cancel: "Annuler",
    submit: "Créer",
};

export const DatasheetCreateNextEnTranslations: Translations<"en">["DatasheetCreateNext"] = {
    title: "Create a dataset",
    cancel: "Cancel",
    submit: "Create",
};

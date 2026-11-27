import { declareComponentKeys } from "@/i18n";
import { type Translations } from "@/i18n/types";

const { i18n } = declareComponentKeys<"title" | "already_published_info" | "cancel" | "submit" | "submitting" | "error_title">()("DatasheetCreate");

export type I18n = typeof i18n;

export const DatasheetCreateFrTranslations: Translations<"fr">["DatasheetCreate"] = {
    title: "Créer une fiche de données",
    already_published_info: "Avant de créer une fiche de données, assurez-vous que votre donnée n’a pas déjà été publiée par un autre producteur.",
    cancel: "Annuler",
    submit: "Créer",
    submitting: "Création de la fiche de données en cours",
    error_title: "La fiche de données n’a pas été créée",
};

export const DatasheetCreateEnTranslations: Translations<"en">["DatasheetCreate"] = {
    title: "Create a datasheet",
    already_published_info: "Before creating a datasheet, make sure your data has not already been published by another producer.",
    cancel: "Cancel",
    submit: "Create",
    submitting: "Creating the datasheet",
    error_title: "The datasheet was not created",
};

import { declareComponentKeys } from "../../../../../i18n/i18n";
import { Translations } from "../../../../../i18n/types";

const { i18n } = declareComponentKeys<
    { K: "delete_community"; P: { text: string }; R: string } | { K: "delete_theme"; P: { text: string }; R: string } | "manage" | "dialog.title"
>()("SharedThemes");
export type I18n = typeof i18n;

export const SharedThemesFrTranslations: Translations<"fr">["SharedThemes"] = {
    delete_community: ({ text }) => `Supprimer tous les thèmes de la communauté [${text}]`,
    delete_theme: ({ text }) => `Remove theme [${text}]`,
    manage: "Gérer",
    "dialog.title": "Sélectionner les thèmes partagés à afficher",
};

export const SharedThemesEnTranslations: Translations<"en">["SharedThemes"] = {
    delete_community: ({ text }) => `Remove all themes of the community [${text}]`,
    delete_theme: ({ text }) => `Supprimer le thème [${text}]`,
    manage: "Manage",
    "dialog.title": undefined,
};

import { createI18nApi, declareComponentKeys, type GenericTranslations } from "i18nifty";

// déclaration des langues
/** liste des langues supportées */
export const languages = ["fr", "en"] as const;

/** langue de fallback */
export const fallbackLanguage = "fr";

/** nom d'affichage des langues */
export const languagesDisplayNames: Record<Language, string> = {
    fr: "Français",
    en: "English",
};

// types
export type Language = (typeof languages)[number];
export type ComponentKey =
    | typeof import("../pages/contact/Contact").i18n
    | typeof import("../config/navItems").i18n
    | typeof import("../components/AddStyleForm/AddStyleForm").i18n;

export type Translations<L extends Language> = GenericTranslations<ComponentKey, Language, typeof fallbackLanguage, L>;
export type LocalizedString = Parameters<typeof resolveLocalizedString>[0];

/** initialisation de l'instance de i18n */
export const { useTranslation, getTranslation, resolveLocalizedString, useLang, $lang, useResolveLocalizedString, useIsI18nFetching } =
    createI18nApi<ComponentKey>()(
        { languages, fallbackLanguage },
        {
            en: () => import("./languages/en").then(({ translations }) => translations),
            fr: () => import("./languages/fr").then(({ translations }) => translations),
        }
    );

export { declareComponentKeys };

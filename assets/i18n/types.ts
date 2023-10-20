import type { GenericTranslations } from "i18nifty";

// liste des langues supportées
export const languages = ["fr", "en"] as const;

// langue de fallback
export const fallbackLanguage = "fr";

export type Language = (typeof languages)[number];

export type ComponentKey = typeof import("../pages/contact/Contact").i18n;

export type Translations<L extends Language> = GenericTranslations<ComponentKey, Language, typeof fallbackLanguage, L>;

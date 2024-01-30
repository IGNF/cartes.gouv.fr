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
    | typeof import("./Common").i18n
    | typeof import("./Rights").i18n
    | typeof import("./Style").i18n
    | typeof import("../pages/communities/AddMember").i18n
    | typeof import("../pages/communities/CommunityMembers").i18n
    | typeof import("../pages/service/metadatas/metadatas-form-tr").i18n
    | typeof import("../pages/service/metadatas/metadatas-validation-tr").i18n
    | typeof import("../pages/contact/Contact").i18n
    | typeof import("../config/navItems").i18n
    | typeof import("../config/datastoreNavItems").i18n
    | typeof import("../pages/datasheet/DatasheetView/DatasetListTab/VectorDbList/VectorDbListItem").i18n
    | typeof import("../pages/datasheet/DatasheetView/DatasetListTab/PyramidList/PyramidListItem").i18n
    | typeof import("../pages/datasheet/DatasheetView/DatasheetView").i18n
    | typeof import("../validations/sldStyle").i18n
    | typeof import("../validations/MapboxStyleValidator").i18n
    | typeof import("../modules/Style/TMSStyleFilesManager").i18n
    | typeof import("../pages/datastore/DatastoreManageStorage/DatastoreManageStorage").i18n;

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

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
    | typeof import("./Breadcrumb").i18n
    | typeof import("./Rights").i18n
    | typeof import("./Style").i18n
    | typeof import("../entrepot/pages/users/Me").i18n
    | typeof import("../entrepot/pages/communities/AddMember").i18n
    | typeof import("../entrepot/pages/communities/CommunityMembers").i18n
    | typeof import("../entrepot/pages/dashboard/DashboardPro").i18n
    | typeof import("../entrepot/pages/users/MyAccessKeys").i18n
    | typeof import("../entrepot/pages/users/keys/UserKeysListTab").i18n
    | typeof import("../entrepot/pages/users/keys/UserKeyTr").i18n
    | typeof import("../entrepot/pages/users/permissions/PermissionsTr").i18n
    | typeof import("../entrepot/pages/service/metadatas/metadatas-form-tr").i18n
    | typeof import("../entrepot/pages/service/metadatas/metadatas-validation-tr").i18n
    | typeof import("../entrepot/pages/AccessesRequest").i18n
    | typeof import("../pages/assistance/contact/Contact").i18n
    | typeof import("../entrepot/pages/datastore/ManageStorage/DatastoreManageStorage").i18n
    | typeof import("../entrepot/pages/datastore/ManagePermissions/DatastorePermissionsTr").i18n
    | typeof import("../entrepot/pages/datasheet/DatasheetNew/DatasheetUploadForm").i18n
    | typeof import("../entrepot/pages/datasheet/DatasheetList/DatasheetList").i18n
    | typeof import("../entrepot/pages/datasheet/DatasheetView/DatasetListTab/VectorDbList/VectorDbListItem").i18n
    | typeof import("../entrepot/pages/datasheet/DatasheetView/DatasetListTab/PyramidVectorList/PyramidVectorListItem").i18n
    | typeof import("../entrepot/pages/datasheet/DatasheetView/DatasetListTab/PyramidRasterList/PyramidRasterListItem").i18n
    | typeof import("../entrepot/pages/datasheet/DatasheetView/DatasheetView").i18n
    | typeof import("../config/navItems").i18n
    | typeof import("../config/datastoreNavItems").i18n
    | typeof import("../validations/SldStyleValidationErrorsTr").i18n
    | typeof import("../validations/MapboxStyleValidator").i18n
    | typeof import("../modules/Style/TMSStyleFilesManager").i18n
    | typeof import("../entrepot/pages/service/wms-vector/WmsVectorServiceForm").i18n
    | typeof import("../entrepot/pages/service/wfs/WfsServiceForm").i18n
    | typeof import("../entrepot/pages/service/tms/PyramidVectorTmsServiceForm").i18n
    | typeof import("../entrepot/pages/service/wms-raster-wmts/PyramidRasterGenerateForm").i18n
    | typeof import("../entrepot/pages/service/wms-raster-wmts/PyramidRasterWmsRasterServiceForm").i18n
    | typeof import("../entrepot/pages/service/wms-raster-wmts/PyramidRasterWmtsServiceForm").i18n
    | typeof import("../entrepot/pages/service/TableSelection").i18n
    | typeof import("../entrepot/pages/service/AccessRestrictions").i18n
    | typeof import("../entrepot/pages/service/wms-vector/UploadStyleFile").i18n
    | typeof import("../espaceco/pages/communities/EspaceCoCommunitiesTr").i18n;

export type Translations<L extends Language> = GenericTranslations<ComponentKey, Language, typeof fallbackLanguage, L>;
export type LocalizedString = Parameters<typeof resolveLocalizedString>[0];

/** initialisation de l'instance de i18n */
export const { useTranslation, getTranslation, resolveLocalizedString, useLang, $lang, useResolveLocalizedString, useIsI18nFetching, I18nFetchingSuspense } =
    createI18nApi<ComponentKey>()(
        { languages, fallbackLanguage },
        {
            en: () => import("./languages/en").then(({ translations }) => translations),
            fr: () => import("./languages/fr").then(({ translations }) => translations),
        }
    );

export { declareComponentKeys };

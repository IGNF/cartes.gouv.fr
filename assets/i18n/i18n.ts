import { createI18nApi, declareComponentKeys } from "i18nifty";

import { ComponentKey, fallbackLanguage, languages } from "./types";

export { declareComponentKeys };

<<<<<<< HEAD
=======
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
    | typeof import("../entrepot/pages/datasheet/DatasheetView/DatasetListTab/PyramidList/PyramidListItem").i18n
    | typeof import("../entrepot/pages/datasheet/DatasheetView/DatasheetView").i18n
    | typeof import("../config/navItems").i18n
    | typeof import("../config/datastoreNavItems").i18n
    | typeof import("../validations/SldStyleValidationErrorsTr").i18n
    | typeof import("../validations/MapboxStyleValidator").i18n
    | typeof import("../modules/Style/TMSStyleFilesManager").i18n
    | typeof import("../entrepot/pages/service/wms-vector/WmsVectorServiceForm").i18n
    | typeof import("../entrepot/pages/service/wfs/WfsServiceForm").i18n
    | typeof import("../entrepot/pages/service/tms/PyramidVectorTmsServiceForm").i18n
    | typeof import("../entrepot/pages/service/TableSelection").i18n
    | typeof import("../entrepot/pages/service/AccessRestrictions").i18n
    | typeof import("../entrepot/pages/service/wms-vector/UploadStyleFile").i18n
    | typeof import("../espaceco/pages/communities/CommunityListTr").i18n
    | typeof import("../espaceco/pages/communities/ManageCommunityTr").i18n
    | typeof import("../espaceco/pages/communities/management/validationTr").i18n
    | typeof import("../espaceco/pages/communities/management/SearchTr").i18n
    | typeof import("../espaceco/pages/communities/management/Reports").i18n
    | typeof import("../espaceco/pages/communities/management/reports/ThemeTr").i18n
    | typeof import("../espaceco/pages/communities/management/reports/ReportStatusesTr").i18n
    | typeof import("../espaceco/pages/communities/management/reports/SharedThemes").i18n
    | typeof import("../espaceco/pages/communities/management/reports/EmailPlanners").i18n
    | typeof import("../espaceco/pages/communities/management/reports/emailplanners/AddOrEditEmailPlannerTr").i18n
    | typeof import("../espaceco/pages/communities/management/reports/emailplanners/EmailPlannerKeywords").i18n
    | typeof import("../espaceco/pages/communities/management/Members").i18n
    | typeof import("../espaceco/pages/communities/management/member/AddMembersDialog").i18n
    | typeof import("../espaceco/pages/communities/management/member/ManageGridsDialog").i18n;

export type Translations<L extends Language> = GenericTranslations<ComponentKey, Language, typeof fallbackLanguage, L>;
>>>>>>> c0922c9 (feat: Ajout de la gestion des membres pour un guichet (début))
export type LocalizedString = Parameters<typeof resolveLocalizedString>[0];

/** initialisation de l'instance de i18n */
export const {
    useTranslation,
    resolveLocalizedString,
    useLang,
    $lang,
    $readyLang,
    useResolveLocalizedString,
    useIsI18nFetching,
    I18nFetchingSuspense,
    getTranslation,
} = createI18nApi<ComponentKey>()(
    { languages, fallbackLanguage },
    {
        en: () => import("./languages/en").then(({ translations }) => translations),
        fr: () => import("./languages/fr").then(({ translations }) => translations),
    }
);

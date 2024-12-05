import type { GenericTranslations } from "i18nifty";

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
    | import("./Common.tr").I18n
    | import("../modules/entrepot/breadcrumbs/Breadcrumb.tr").I18n
    | import("../entrepot/pages/communities/Rights.tr").I18n
    | import("../entrepot/pages/service/view/Style/Style.tr").I18n
    | import("../entrepot/pages/users/me/Me.tr").I18n
    | import("../entrepot/pages/communities/AddMember/AddMember.tr").I18n
    | import("../entrepot/pages/communities/CommunityMembers/CommunityMembers.tr").I18n
    | import("../entrepot/pages/dashboard/DashboardPro.tr").I18n
    | import("../entrepot/pages/users/access-keys/MyAccessKeys.tr").I18n
    | import("../entrepot/pages/users/keys/UserKeysListTab/UserKeysListTab.tr").I18n
    | import("../entrepot/pages/users/keys/UserKey.tr").I18n
    | import("../entrepot/pages/users/permissions/Permissions.tr").I18n
    | import("../entrepot/pages/service/metadatas/MetadataForm.tr").I18n
    | import("../entrepot/pages/service/metadatas/MetadataValidation.tr").I18n
    | import("../entrepot/pages/accesses-request/AccessesRequest.tr").I18n
    | import("../pages/assistance/contact/Contact.tr").I18n
    | import("../entrepot/pages/datastore/ManageStorage/DatastoreManageStorage.tr").I18n
    | import("../entrepot/pages/datastore/ManagePermissions/DatastorePermissions.tr").I18n
    | import("../entrepot/pages/datasheet/DatasheetNew/DatasheetUploadForm.tr").I18n
    | import("../entrepot/pages/datasheet/DatasheetList/DatasheetList.tr").I18n
    | import("../entrepot/pages/datasheet/DatasheetView/DatasetListTab/VectorDbList/VectorDbList.tr").I18n
    | import("../entrepot/pages/datasheet/DatasheetView/DatasetListTab/PyramidList/PyramidList.tr").I18n
    | import("../entrepot/pages/datasheet/DatasheetView/DatasheetView/DatasheetView.tr").I18n
    | import("../config/navItems/navItems.tr").I18n
    | import("../config/navItems/datastoreNavItems.tr").I18n
    | import("../validations/sld/SldStyleValidation.tr").I18n
    | import("../validations/mapbox/MapboxStyleValidator.tr").I18n
    | import("../modules/Style/TMSStyleFilesManager/TMSStyleFilesManager.tr").I18n
    | import("../entrepot/pages/service/wms-vector/WmsVectorServiceForm.tr").I18n
    | import("../entrepot/pages/service/wfs/WfsServiceForm.tr").I18n
    | import("../entrepot/pages/service/tms/PyramidVectorTmsServiceForm.tr").I18n
    | import("../entrepot/pages/service/TableSelection.tr").I18n
    | import("../entrepot/pages/service/AccessRestrictions.tr").I18n
    | import("../entrepot/pages/service/wms-vector/UploadStyleFile.tr").I18n
    | import("../espaceco/pages/communities/EspaceCoCommunities.tr").I18n
    | import("../pages/LoginDisabled/LoginDisabled.tr").I18n;

export type Translations<L extends Language> = GenericTranslations<ComponentKey, Language, typeof fallbackLanguage, L>;

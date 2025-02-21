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
    | import("./Common.locale").I18n
    | import("../modules/entrepot/breadcrumbs/Breadcrumb.locale").I18n
    | import("../entrepot/pages/communities/Rights.locale").I18n
    | import("../entrepot/pages/service/view/Style/Style.locale").I18n
    | import("../entrepot/pages/users/me/Me.locale").I18n
    | import("../entrepot/pages/communities/AddMember/AddMember.locale").I18n
    | import("../entrepot/pages/communities/CommunityMembers/CommunityMembers.locale").I18n
    | import("../entrepot/pages/communities/CommunityList/CommunityList.locale").I18n
    | import("../entrepot/pages/datastore/DatastoreCreationForm/DatastoreCreationForm.locale").I18n
    | import("../entrepot/pages/dashboard/DashboardPro.locale").I18n
    | import("../entrepot/pages/users/access-keys/MyAccessKeys.locale").I18n
    | import("../entrepot/pages/users/keys/UserKeysListTab/UserKeysListTab.locale").I18n
    | import("../entrepot/pages/users/keys/UserKey.locale").I18n
    | import("../entrepot/pages/users/permissions/Permissions.locale").I18n
    | import("../entrepot/pages/service/metadata/MetadataForm.locale").I18n
    | import("../entrepot/pages/service/metadata/MetadataValidation.locale").I18n
    | import("../entrepot/pages/accesses-request/AccessesRequest.locale").I18n
    | import("../pages/assistance/contact/Contact.locale").I18n
    | import("../entrepot/pages/datastore/ManageStorage/DatastoreManageStorage.locale").I18n
    | import("../entrepot/pages/datastore/ManagePermissions/DatastorePermissions.locale").I18n
    | import("../entrepot/pages/datasheet/DatasheetNew/DatasheetUploadForm/DatasheetUploadForm.locale").I18n
    | import("../entrepot/pages/datasheet/DatasheetNew/DatasheetUploadIntegration/DatasheetUploadIntegration.locale").I18n
    | import("../entrepot/pages/datasheet/DatasheetList/DatasheetList.locale").I18n
    | import("../entrepot/pages/datasheet/DatasheetView/DatasetListTab/VectorDbList/VectorDbList.locale").I18n
    | import("../entrepot/pages/datasheet/DatasheetView/DatasetListTab/PyramidVectorList/PyramidVectorList.locale").I18n
    | import("../entrepot/pages/datasheet/DatasheetView/DatasetListTab/PyramidRasterList/PyramidRasterList.locale").I18n
    | import("../entrepot/pages/datasheet/DatasheetView/DatasheetView/DatasheetView.locale").I18n
    | import("../config/navItems/navItems.locale").I18n
    | import("../config/navItems/datastoreNavItems.locale").I18n
    | import("../validations/sld/SldStyleValidation.locale").I18n
    | import("../validations/mapbox/MapboxStyleValidator.locale").I18n
    | import("../modules/Style/TMSStyleFilesManager/TMSStyleFilesManager.locale").I18n
    | import("../entrepot/pages/service/wms-vector/WmsVectorServiceForm.locale").I18n
    | import("../entrepot/pages/service/wfs/WfsServiceForm.locale").I18n
    | import("../entrepot/pages/service/tms/PyramidVectorTmsServiceForm/PyramidVectorTmsServiceForm.locale").I18n
    | import("../entrepot/pages/service/tms/PyramidVectorGenerateForm/PyramidVectorGenerateForm.locale").I18n
    | import("../entrepot/pages/service/wms-raster-wmts/PyramidRasterGenerateForm/PyramidRasterGenerateForm.locale").I18n
    | import("../entrepot/pages/service/wms-raster-wmts/PyramidRasterWmsRasterServiceForm/PyramidRasterWmsRasterServiceForm.locale").I18n
    | import("../entrepot/pages/service/wms-raster-wmts/PyramidRasterWmtsServiceForm/PyramidRasterWmtsServiceForm.locale").I18n
    | import("../entrepot/pages/service/common/TableSelection/TableSelection.locale").I18n
    | import("../entrepot/pages/service/common/AccessRestrictions/AccessRestrictions.locale").I18n
    | import("../entrepot/pages/service/wms-vector/UploadStyleFile.locale").I18n
    | import("../pages/LoginDisabled/LoginDisabled.locale").I18n
    | import("../espaceco/pages/communities/CommunityList.locale").I18n
    | import("../espaceco/pages/communities/CreateCommunityDialog.locale").I18n
    | import("../espaceco/pages/communities/CreateCommunity.locale").I18n
    | import("../espaceco/pages/communities/ManageCommunity.locale").I18n
    | import("../espaceco/pages/communities/management/ManageCommunityValidations.locale").I18n
    | import("../espaceco/pages/communities/management/Search.locale").I18n
    | import("../espaceco/pages/communities/management/tools/Functionalities.locale").I18n
    | import("../espaceco/pages/communities/management/tools/LayerTools.locale").I18n
    | import("../espaceco/pages/communities/management/Reports.locale").I18n
    | import("../espaceco/pages/communities/management/reports/Theme.locale").I18n
    | import("../espaceco/pages/communities/management/reports/ReportStatuses.locale").I18n
    | import("../espaceco/pages/communities/management/reports/SharedThemes.locale").I18n
    | import("../espaceco/pages/communities/management/reports/EmailPlanners").I18n
    | import("../espaceco/pages/communities/management/reports/emailplanners/AddOrEditEmailPlanner.locale").I18n
    | import("../espaceco/pages/communities/management/reports/emailplanners/EmailPlannerKeywords.locale").I18n
    | import("../espaceco/pages/communities/management/Members.locale").I18n
    | import("../espaceco/pages/communities/management/member/AddMembersDialog.locale").I18n
    | import("../espaceco/pages/communities/management/member/ManageGridsDialog.locale").I18n
    | import("../espaceco/pages/communities/management/reports/AutofillKeywords.locale").I18n
    | import("../espaceco/pages/communities/management/reports/AutofillDialog.locale").I18n
    | import("../espaceco/pages/communities/MemberInvitation.locale").I18n
    | import("../components/Input/InputCollection").I18n
    | import("../entrepot/pages/config/Alerts.locale").I18n
    | import("../espaceco/pages/communities/CommunityList.locale").I18n
    | import("../pages/LoginDisabled/LoginDisabled.locale").I18n
    | import("../components/Input/KeyValueList.locale").I18n;

export type Translations<L extends Language> = GenericTranslations<ComponentKey, Language, typeof fallbackLanguage, L>;

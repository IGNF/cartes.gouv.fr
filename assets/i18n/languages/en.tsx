import { datastoreNavItemsEnTranslations } from "../../config/navItems/datastoreNavItems.locale";
import { navItemsEnTranslations } from "../../config/navItems/navItems.locale";
import { AccessesRequestEnTranslations } from "../../entrepot/pages/accesses-request/AccessesRequest.locale";
import { AddMemberEnTranslations } from "../../entrepot/pages/communities/AddMember/AddMember.locale";
import { CommunityListEnTranslations } from "../../entrepot/pages/communities/CommunityList/CommunityList.locale";
import { CommunityMembersEnTranslations } from "../../entrepot/pages/communities/CommunityMembers/CommunityMembers.locale";
import { RightsEnTranslations } from "../../entrepot/pages/communities/Rights.locale";
import { DashboardProEnTranslations } from "../../entrepot/pages/dashboard/DashboardPro.locale";
import { DatasheetListEnTranslations } from "../../entrepot/pages/datasheet/DatasheetList/DatasheetList.locale";
import { DatasheetUploadFormEnTranslations } from "../../entrepot/pages/datasheet/DatasheetNew/DatasheetUploadForm/DatasheetUploadForm.locale";
import { DatasheetUploadIntegrationEnTranslations } from "../../entrepot/pages/datasheet/DatasheetNew/DatasheetUploadIntegration/DatasheetUploadIntegration.locale";
import { PyramidRasterListEnTranslations } from "../../entrepot/pages/datasheet/DatasheetView/DatasetListTab/PyramidRasterList/PyramidRasterList.locale";
import { PyramidVectorListEnTranslations } from "../../entrepot/pages/datasheet/DatasheetView/DatasetListTab/PyramidVectorList/PyramidVectorList.locale";
import { VectorDbListEnTranslations } from "../../entrepot/pages/datasheet/DatasheetView/DatasetListTab/VectorDbList/VectorDbList.locale";
import { DatasheetViewEnTranslations } from "../../entrepot/pages/datasheet/DatasheetView/DatasheetView/DatasheetView.locale";
import { DatastoreCreationFormEnTranslations } from "../../entrepot/pages/datastore/DatastoreCreationForm/DatastoreCreationForm.locale";
import { DatastorePermissionsEnTranslations } from "../../entrepot/pages/datastore/ManagePermissions/DatastorePermissions.locale";
import { DatastoreManageStorageEnTranslations } from "../../entrepot/pages/datastore/ManageStorage/DatastoreManageStorage.locale";
import { AccessRestrictionsEnTranslations } from "../../entrepot/pages/service/common/AccessRestrictions/AccessRestrictions.locale";
import { TableSelectionEnTranslations } from "../../entrepot/pages/service/common/TableSelection/TableSelection.locale";
import { MetadatasFormEnTranslations } from "../../entrepot/pages/service/metadata/MetadataForm.locale";
import { ValidationMetadatasEnTranslations } from "../../entrepot/pages/service/metadata/MetadataValidation.locale";
import { PyramidVectorGenerateFormEnTranslations } from "../../entrepot/pages/service/tms/PyramidVectorGenerateForm/PyramidVectorGenerateForm.locale";
import { PyramidVectorTmsServiceFormEnTranslations } from "../../entrepot/pages/service/tms/PyramidVectorTmsServiceForm/PyramidVectorTmsServiceForm.locale";
import { StyleEnTranslations } from "../../entrepot/pages/service/view/Style/Style.locale";
import { WfsServiceFormEnTranslations } from "../../entrepot/pages/service/wfs/WfsServiceForm.locale";
import { PyramidRasterGenerateFormEnTranslations } from "../../entrepot/pages/service/wms-raster-wmts/PyramidRasterGenerateForm/PyramidRasterGenerateForm.locale";
import { PyramidRasterWmsRasterServiceFormEnTranslations } from "../../entrepot/pages/service/wms-raster-wmts/PyramidRasterWmsRasterServiceForm/PyramidRasterWmsRasterServiceForm.locale";
import { PyramidRasterWmtsServiceFormEnTranslations } from "../../entrepot/pages/service/wms-raster-wmts/PyramidRasterWmtsServiceForm/PyramidRasterWmtsServiceForm.locale";
import { UploadStyleFileEnTranslations } from "../../entrepot/pages/service/wms-vector/UploadStyleFile.locale";
import { WmsVectorServiceFormEnTranslations } from "../../entrepot/pages/service/wms-vector/WmsVectorServiceForm.locale";
import { MyAccessKeysEnTranslations } from "../../entrepot/pages/users/access-keys/MyAccessKeys.locale";
import { UserKeyEnTranslations } from "../../entrepot/pages/users/keys/UserKey.locale";
import { UserKeysListTabEnTranslations } from "../../entrepot/pages/users/keys/UserKeysListTab/UserKeysListTab.locale";
import { MeEnTranslations } from "../../entrepot/pages/users/me/Me.locale";
import { PermissionsEnTranslations } from "../../entrepot/pages/users/permissions/Permissions.locale";
import { CommunityListEnTranslations } from "../../espaceco/pages/communities/CommunityListTr";
import { ManageCommunityEnTranslations } from "../../espaceco/pages/communities/ManageCommunityTr";
import { ManageCommunityValidationsEnTranslations } from "../../espaceco/pages/communities/management/validationTr";
import { SearchEnTranslations } from "../../espaceco/pages/communities/management/Search";
import { TMSStyleFilesManagerEnTranslations } from "../../modules/Style/TMSStyleFilesManager/TMSStyleFilesManager.locale";
import { BreadcrumbEnTranslations } from "../../modules/entrepot/breadcrumbs/Breadcrumb.locale";
import { LoginDisabledEnTranslations } from "../../pages/LoginDisabled/LoginDisabled.locale";
import { ContactEnTranslations } from "../../pages/assistance/contact/Contact.locale";
import { mapboxStyleValidationEnTranslations } from "../../validations/mapbox/MapboxStyleValidator.locale";
import { SldStyleValidationErrorsEnTranslations } from "../../validations/sld/SldStyleValidation.locale";
import { ThemeEnTranslations } from "../../espaceco/pages/communities/management/reports/ThemeTr";
import { commonEnTranslations } from "../Common.locale";
import { ReportStatusesEnTranslations } from "../../espaceco/pages/communities/management/reports/ReportStatusesTr";
import { SharedThemesEnTranslations } from "../../espaceco/pages/communities/management/reports/SharedThemes";
import type { Translations } from "../types";

export const translations: Translations<"en"> = {
    Common: commonEnTranslations,
    Breadcrumb: BreadcrumbEnTranslations,
    Rights: RightsEnTranslations,
    Style: StyleEnTranslations,
    Me: MeEnTranslations,
    AddMember: AddMemberEnTranslations,
    CommunityMembers: CommunityMembersEnTranslations,
    CommunityList: CommunityListEnTranslations,
    DatastoreCreationForm: DatastoreCreationFormEnTranslations,
    DatasheetUploadIntegration: DatasheetUploadIntegrationEnTranslations,
    DashboardPro: DashboardProEnTranslations,
    MyAccessKeys: MyAccessKeysEnTranslations,
    UserKeysListTab: UserKeysListTabEnTranslations,
    UserKey: UserKeyEnTranslations,
    Permissions: PermissionsEnTranslations,
    ValidationMetadatas: ValidationMetadatasEnTranslations,
    MetadatasForm: MetadatasFormEnTranslations,
    Contact: ContactEnTranslations,
    AccessesRequest: AccessesRequestEnTranslations,
    navItems: navItemsEnTranslations,
    datastoreNavItems: datastoreNavItemsEnTranslations,
    VectorDbList: VectorDbListEnTranslations,
    PyramidVectorList: PyramidVectorListEnTranslations,
    PyramidRasterList: PyramidRasterListEnTranslations,
    DatasheetView: DatasheetViewEnTranslations,
    SldStyleValidationErrors: SldStyleValidationErrorsEnTranslations,
    mapboxStyleValidation: mapboxStyleValidationEnTranslations,
    TMSStyleFilesManager: TMSStyleFilesManagerEnTranslations,
    DatastoreManageStorage: DatastoreManageStorageEnTranslations,
    DatastorePermissions: DatastorePermissionsEnTranslations,
    WmsVectorServiceForm: WmsVectorServiceFormEnTranslations,
    WfsServiceForm: WfsServiceFormEnTranslations,
    TableSelection: TableSelectionEnTranslations,
    UploadStyleFile: UploadStyleFileEnTranslations,
    PyramidVectorGenerateForm: PyramidVectorGenerateFormEnTranslations,
    PyramidVectorTmsServiceForm: PyramidVectorTmsServiceFormEnTranslations,
    PyramidRasterGenerateForm: PyramidRasterGenerateFormEnTranslations,
    PyramidRasterWmsRasterServiceForm: PyramidRasterWmsRasterServiceFormEnTranslations,
    PyramidRasterWmtsServiceForm: PyramidRasterWmtsServiceFormEnTranslations,
    CommunityList: CommunityListEnTranslations,
    ManageCommunity: ManageCommunityEnTranslations,
    ManageCommunityValidations: ManageCommunityValidationsEnTranslations,
    DatasheetUploadForm: DatasheetUploadFormEnTranslations,
    DatasheetList: DatasheetListEnTranslations,
    AccessRestrictions: AccessRestrictionsEnTranslations,
    LoginDisabled: LoginDisabledEnTranslations,
    Theme: ThemeEnTranslations,
    ReportStatuses: ReportStatusesEnTranslations,
    SharedThemes: SharedThemesEnTranslations,
    Search: SearchEnTranslations,
};

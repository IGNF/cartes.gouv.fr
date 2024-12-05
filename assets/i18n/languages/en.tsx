import { PyramidRasterGenerateFormEnTranslations } from "../../entrepot/pages/service/wms-raster-wmts/PyramidRasterGenerateForm";
import { PyramidRasterWmsRasterServiceFormEnTranslations } from "../../entrepot/pages/service/wms-raster-wmts/PyramidRasterWmsRasterServiceForm";
import { PyramidRasterWmtsServiceFormEnTranslations } from "../../entrepot/pages/service/wms-raster-wmts/PyramidRasterWmtsServiceForm";
import { datastoreNavItemsEnTranslations } from "../../config/navItems/datastoreNavItems.tr";
import { navItemsEnTranslations } from "../../config/navItems/navItems.tr";
import { AccessesRequestEnTranslations } from "../../entrepot/pages/accesses-request/AccessesRequest.tr";
import { AddMemberEnTranslations } from "../../entrepot/pages/communities/AddMember/AddMember.tr";
import { CommunityMembersEnTranslations } from "../../entrepot/pages/communities/CommunityMembers/CommunityMembers.tr";
import { DashboardProEnTranslations } from "../../entrepot/pages/dashboard/DashboardPro.tr";
import { DatasheetListEnTranslations } from "../../entrepot/pages/datasheet/DatasheetList/DatasheetList.tr";
import { DatasheetUploadFormEnTranslations } from "../../entrepot/pages/datasheet/DatasheetNew/DatasheetUploadForm.tr";
import { PyramidListFrTranslations } from "../../entrepot/pages/datasheet/DatasheetView/DatasetListTab/PyramidList/PyramidList.tr";
import { VectorDbListEnTranslations } from "../../entrepot/pages/datasheet/DatasheetView/DatasetListTab/VectorDbList/VectorDbList.tr";
import { DatasheetViewEnTranslations } from "../../entrepot/pages/datasheet/DatasheetView/DatasheetView/DatasheetView.tr";
import { DatastorePermissionsEnTranslations } from "../../entrepot/pages/datastore/ManagePermissions/DatastorePermissions.tr";
import { DatastoreManageStorageEnTranslations } from "../../entrepot/pages/datastore/ManageStorage/DatastoreManageStorage.tr";
import { AccessRestrictionsEnTranslations } from "../../entrepot/pages/service/AccessRestrictions.tr";
import { TableSelectionEnTranslations } from "../../entrepot/pages/service/TableSelection.tr";
import { MetadatasFormEnTranslations } from "../../entrepot/pages/service/metadatas/MetadataForm.tr";
import { ValidationMetadatasEnTranslations } from "../../entrepot/pages/service/metadatas/MetadataValidation.tr";
import { PyramidVectorTmsServiceFormEnTranslations } from "../../entrepot/pages/service/tms/PyramidVectorTmsServiceForm.tr";
import { WfsServiceFormEnTranslations } from "../../entrepot/pages/service/wfs/WfsServiceForm.tr";
import { UploadStyleFileEnTranslations } from "../../entrepot/pages/service/wms-vector/UploadStyleFile.tr";
import { WmsVectorServiceFormEnTranslations } from "../../entrepot/pages/service/wms-vector/WmsVectorServiceForm.tr";
import { MyAccessKeysEnTranslations } from "../../entrepot/pages/users/access-keys/MyAccessKeys.tr";
import { UserKeyEnTranslations } from "../../entrepot/pages/users/keys/UserKey.tr";
import { UserKeysListTabEnTranslations } from "../../entrepot/pages/users/keys/UserKeysListTab/UserKeysListTab.tr";
import { MeEnTranslations } from "../../entrepot/pages/users/me/Me.tr";
import { PermissionsEnTranslations } from "../../entrepot/pages/users/permissions/Permissions.tr";
import { EspaceCoCommunitiesEnTranslations } from "../../espaceco/pages/communities/EspaceCoCommunities.tr";
import { TMSStyleFilesManagerEnTranslations } from "../../modules/Style/TMSStyleFilesManager/TMSStyleFilesManager.tr";
import { LoginDisabledEnTranslations } from "../../pages/LoginDisabled/LoginDisabled.tr";
import { contactEnTranslations } from "../../pages/assistance/contact/Contact.tr";
import { mapboxStyleValidationEnTranslations } from "../../validations/mapbox/MapboxStyleValidator.tr";
import { SldStyleValidationErrorsEnTranslations } from "../../validations/sld/SldStyleValidation.tr";
import { BreadcrumbEnTranslations } from "../Breadcrumb.tr";
import { commonEnTranslations } from "../Common.tr";
import { RightsEnTranslations } from "../Rights.tr";
import { StyleEnTranslations } from "../Style.tr";
import type { Translations } from "../types";

export const translations: Translations<"en"> = {
    Common: commonEnTranslations,
    Breadcrumb: BreadcrumbEnTranslations,
    Rights: RightsEnTranslations,
    Style: StyleEnTranslations,
    Me: MeEnTranslations,
    AddMember: AddMemberEnTranslations,
    CommunityMembers: CommunityMembersEnTranslations,
    DashboardPro: DashboardProEnTranslations,
    MyAccessKeys: MyAccessKeysEnTranslations,
    UserKeysListTab: UserKeysListTabEnTranslations,
    UserKey: UserKeyEnTranslations,
    Permissions: PermissionsEnTranslations,
    ValidationMetadatas: ValidationMetadatasEnTranslations,
    MetadatasForm: MetadatasFormEnTranslations,
    Contact: contactEnTranslations,
    AccessesRequest: AccessesRequestEnTranslations,
    navItems: navItemsEnTranslations,
    datastoreNavItems: datastoreNavItemsEnTranslations,
    VectorDbListItem: VectorDbListItemEnTranslations,
    PyramidVectorListItem: PyramidVectorListItemEnTranslations,
    PyramidRasterListItem: PyramidRasterListItemEnTranslations,
    VectorDbList: VectorDbListEnTranslations,
    PyramidList: PyramidListFrTranslations,
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
    PyramidVectorTmsServiceForm: PyramidVectorTmsServiceFormEnTranslations,
    PyramidRasterGenerateForm: PyramidRasterGenerateFormEnTranslations,
    PyramidRasterWmsRasterServiceForm: PyramidRasterWmsRasterServiceFormEnTranslations,
    PyramidRasterWmtsServiceForm: PyramidRasterWmtsServiceFormEnTranslations,
    EspaceCoCommunities: EspaceCoCommunitiesEnTranslations,
    DatasheetUploadForm: DatasheetUploadFormEnTranslations,
    DatasheetList: DatasheetListEnTranslations,
    AccessRestrictions: AccessRestrictionsEnTranslations,
    LoginDisabled: LoginDisabledEnTranslations,
};

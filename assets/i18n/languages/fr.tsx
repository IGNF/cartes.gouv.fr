import { datastoreNavItemsFrTranslations } from "../../config/navItems/datastoreNavItems.locale";
import { navItemsFrTranslations } from "../../config/navItems/navItems.locale";
import { AccessesRequestFrTranslations } from "../../entrepot/pages/accesses-request/AccessesRequest.locale";
import { AddMemberFrTranslations } from "../../entrepot/pages/communities/AddMember/AddMember.locale";
import { CommunityMembersFrTranslations } from "../../entrepot/pages/communities/CommunityMembers/CommunityMembers.locale";
import { RightsFrTranslations } from "../../entrepot/pages/communities/Rights.locale";
import { DashboardProFrTranslations } from "../../entrepot/pages/dashboard/DashboardPro.locale";
import { DatasheetListFrTranslations } from "../../entrepot/pages/datasheet/DatasheetList/DatasheetList.locale";
import { DatasheetUploadFormFrTranslations } from "../../entrepot/pages/datasheet/DatasheetNew/DatasheetUploadForm.locale";
import { PyramidRasterListFrTranslations } from "../../entrepot/pages/datasheet/DatasheetView/DatasetListTab/PyramidRasterList/PyramidRasterList.locale";
import { PyramidVectorListFrTranslations } from "../../entrepot/pages/datasheet/DatasheetView/DatasetListTab/PyramidVectorList/PyramidVectorList.locale";
import { VectorDbListFrTranslations } from "../../entrepot/pages/datasheet/DatasheetView/DatasetListTab/VectorDbList/VectorDbList.locale";
import { DatasheetViewFrTranslations } from "../../entrepot/pages/datasheet/DatasheetView/DatasheetView/DatasheetView.locale";
import { DatastorePermissionsFrTranslations } from "../../entrepot/pages/datastore/ManagePermissions/DatastorePermissions.locale";
import { DatastoreManageStorageFrTranslations } from "../../entrepot/pages/datastore/ManageStorage/DatastoreManageStorage.locale";
import { AccessRestrictionsFrTranslations } from "../../entrepot/pages/service/common/AccessRestrictions/AccessRestrictions.locale";
import { TableSelectionFrTranslations } from "../../entrepot/pages/service/common/TableSelection/TableSelection.locale";
import { MetadatasFormFrTranslations } from "../../entrepot/pages/service/metadata/MetadataForm.locale";
import { ValidationMetadatasFrTranslations } from "../../entrepot/pages/service/metadata/MetadataValidation.locale";
import { PyramidVectorTmsServiceFormFrTranslations } from "../../entrepot/pages/service/tms/PyramidVectorTmsServiceForm/PyramidVectorTmsServiceForm.locale";
import { StyleFrTranslations } from "../../entrepot/pages/service/view/Style/Style.locale";
import { WfsServiceFormFrTranslations } from "../../entrepot/pages/service/wfs/WfsServiceForm.locale";
import { PyramidRasterGenerateFormFrTranslations } from "../../entrepot/pages/service/wms-raster-wmts/PyramidRasterGenerateForm/PyramidRasterGenerateForm.locale";
import { PyramidRasterWmsRasterServiceFormFrTranslations } from "../../entrepot/pages/service/wms-raster-wmts/PyramidRasterWmsRasterServiceForm/PyramidRasterWmsRasterServiceForm.locale";
import { PyramidRasterWmtsServiceFormFrTranslations } from "../../entrepot/pages/service/wms-raster-wmts/PyramidRasterWmtsServiceForm/PyramidRasterWmtsServiceForm.locale";
import { UploadStyleFileFrTranslations } from "../../entrepot/pages/service/wms-vector/UploadStyleFile.locale";
import { WmsVectorServiceFormFrTranslations } from "../../entrepot/pages/service/wms-vector/WmsVectorServiceForm.locale";
import { MyAccessKeysFrTranslations } from "../../entrepot/pages/users/access-keys/MyAccessKeys.locale";
import { UserKeyFrTranslations } from "../../entrepot/pages/users/keys/UserKey.locale";
import { UserKeysListTabFrTranslations } from "../../entrepot/pages/users/keys/UserKeysListTab/UserKeysListTab.locale";
import { MeFrTranslations } from "../../entrepot/pages/users/me/Me.locale";
import { PermissionsFrTranslations } from "../../entrepot/pages/users/permissions/Permissions.locale";
import { EspaceCoCommunitiesFrTranslations } from "../../espaceco/pages/communities/EspaceCoCommunities.locale";
import { TMSStyleFilesManagerFrTranslations } from "../../modules/Style/TMSStyleFilesManager/TMSStyleFilesManager.locale";
import { BreadcrumbFrTranslations } from "../../modules/entrepot/breadcrumbs/Breadcrumb.locale";
import { LoginDisabledFrTranslations } from "../../pages/LoginDisabled/LoginDisabled.locale";
import { ContactFrTranslations } from "../../pages/assistance/contact/Contact.locale";
import { mapboxStyleValidationFrTranslations } from "../../validations/mapbox/MapboxStyleValidator.locale";
import { SldStyleValidationErrorsFrTranslations } from "../../validations/sld/SldStyleValidation.locale";
import { commonFrTranslations } from "../Common.locale";
import type { Translations } from "../types";

export const translations: Translations<"fr"> = {
    Common: commonFrTranslations,
    Breadcrumb: BreadcrumbFrTranslations,
    Rights: RightsFrTranslations,
    Style: StyleFrTranslations,
    Me: MeFrTranslations,
    AddMember: AddMemberFrTranslations,
    CommunityMembers: CommunityMembersFrTranslations,
    DashboardPro: DashboardProFrTranslations,
    MyAccessKeys: MyAccessKeysFrTranslations,
    UserKeysListTab: UserKeysListTabFrTranslations,
    UserKey: UserKeyFrTranslations,
    Permissions: PermissionsFrTranslations,
    MetadatasForm: MetadatasFormFrTranslations,
    ValidationMetadatas: ValidationMetadatasFrTranslations,
    Contact: ContactFrTranslations,
    AccessesRequest: AccessesRequestFrTranslations,
    navItems: navItemsFrTranslations,
    datastoreNavItems: datastoreNavItemsFrTranslations,
    VectorDbList: VectorDbListFrTranslations,
    PyramidVectorList: PyramidVectorListFrTranslations,
    PyramidRasterList: PyramidRasterListFrTranslations,
    DatasheetView: DatasheetViewFrTranslations,
    SldStyleValidationErrors: SldStyleValidationErrorsFrTranslations,
    mapboxStyleValidation: mapboxStyleValidationFrTranslations,
    TMSStyleFilesManager: TMSStyleFilesManagerFrTranslations,
    DatastoreManageStorage: DatastoreManageStorageFrTranslations,
    DatastorePermissions: DatastorePermissionsFrTranslations,
    WmsVectorServiceForm: WmsVectorServiceFormFrTranslations,
    WfsServiceForm: WfsServiceFormFrTranslations,
    TableSelection: TableSelectionFrTranslations,
    UploadStyleFile: UploadStyleFileFrTranslations,
    PyramidVectorTmsServiceForm: PyramidVectorTmsServiceFormFrTranslations,
    PyramidRasterGenerateForm: PyramidRasterGenerateFormFrTranslations,
    PyramidRasterWmsRasterServiceForm: PyramidRasterWmsRasterServiceFormFrTranslations,
    PyramidRasterWmtsServiceForm: PyramidRasterWmtsServiceFormFrTranslations,
    EspaceCoCommunities: EspaceCoCommunitiesFrTranslations,
    DatasheetUploadForm: DatasheetUploadFormFrTranslations,
    DatasheetList: DatasheetListFrTranslations,
    AccessRestrictions: AccessRestrictionsFrTranslations,
    LoginDisabled: LoginDisabledFrTranslations,
};

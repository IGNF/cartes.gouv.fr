import { PyramidRasterGenerateFormFrTranslations } from "../../entrepot/pages/service/wms-raster-wmts/PyramidRasterGenerateForm";
import { PyramidRasterWmsRasterServiceFormFrTranslations } from "../../entrepot/pages/service/wms-raster-wmts/PyramidRasterWmsRasterServiceForm";
import { PyramidRasterWmtsServiceFormFrTranslations } from "../../entrepot/pages/service/wms-raster-wmts/PyramidRasterWmtsServiceForm";
import { datastoreNavItemsFrTranslations } from "../../config/navItems/datastoreNavItems.tr";
import { navItemsFrTranslations } from "../../config/navItems/navItems.tr";
import { AccessesRequestFrTranslations } from "../../entrepot/pages/accesses-request/AccessesRequest.tr";
import { AddMemberFrTranslations } from "../../entrepot/pages/communities/AddMember/AddMember.tr";
import { CommunityMembersFrTranslations } from "../../entrepot/pages/communities/CommunityMembers/CommunityMembers.tr";
import { DashboardProFrTranslations } from "../../entrepot/pages/dashboard/DashboardPro.tr";
import { DatasheetListFrTranslations } from "../../entrepot/pages/datasheet/DatasheetList/DatasheetList.tr";
import { DatasheetUploadFormFrTranslations } from "../../entrepot/pages/datasheet/DatasheetNew/DatasheetUploadForm.tr";
import { PyramidListFrTranslations } from "../../entrepot/pages/datasheet/DatasheetView/DatasetListTab/PyramidList/PyramidList.tr";
import { VectorDbListFrTranslations } from "../../entrepot/pages/datasheet/DatasheetView/DatasetListTab/VectorDbList/VectorDbList.tr";
import { DatasheetViewFrTranslations } from "../../entrepot/pages/datasheet/DatasheetView/DatasheetView/DatasheetView.tr";
import { DatastorePermissionsFrTranslations } from "../../entrepot/pages/datastore/ManagePermissions/DatastorePermissions.tr";
import { DatastoreManageStorageFrTranslations } from "../../entrepot/pages/datastore/ManageStorage/DatastoreManageStorage.tr";
import { AccessRestrictionsFrTranslations } from "../../entrepot/pages/service/AccessRestrictions.tr";
import { TableSelectionFrTranslations } from "../../entrepot/pages/service/TableSelection.tr";
import { MetadatasFormFrTranslations } from "../../entrepot/pages/service/metadatas/MetadataForm.tr";
import { ValidationMetadatasFrTranslations } from "../../entrepot/pages/service/metadatas/MetadataValidation.tr";
import { PyramidVectorTmsServiceFormFrTranslations } from "../../entrepot/pages/service/tms/PyramidVectorTmsServiceForm.tr";
import { WfsServiceFormFrTranslations } from "../../entrepot/pages/service/wfs/WfsServiceForm.tr";
import { UploadStyleFileFrTranslations } from "../../entrepot/pages/service/wms-vector/UploadStyleFile.tr";
import { WmsVectorServiceFormFrTranslations } from "../../entrepot/pages/service/wms-vector/WmsVectorServiceForm.tr";
import { MyAccessKeysFrTranslations } from "../../entrepot/pages/users/access-keys/MyAccessKeys.tr";
import { UserKeyFrTranslations } from "../../entrepot/pages/users/keys/UserKey.tr";
import { UserKeysListTabFrTranslations } from "../../entrepot/pages/users/keys/UserKeysListTab/UserKeysListTab.tr";
import { MeFrTranslations } from "../../entrepot/pages/users/me/Me.tr";
import { PermissionsFrTranslations } from "../../entrepot/pages/users/permissions/Permissions.tr";
import { EspaceCoCommunitiesFrTranslations } from "../../espaceco/pages/communities/EspaceCoCommunities.tr";
import { TMSStyleFilesManagerFrTranslations } from "../../modules/Style/TMSStyleFilesManager/TMSStyleFilesManager.tr";
import { LoginDisabledFrTranslations } from "../../pages/LoginDisabled/LoginDisabled.tr";
import { contactFrTranslations } from "../../pages/assistance/contact/Contact.tr";
import { mapboxStyleValidationFrTranslations } from "../../validations/mapbox/MapboxStyleValidator.tr";
import { SldStyleValidationErrorsFrTranslations } from "../../validations/sld/SldStyleValidation.tr";
import { BreadcrumbFrTranslations } from "../Breadcrumb.tr";
import { commonFrTranslations } from "../Common.tr";
import { RightsFrTranslations } from "../Rights.tr";
import { StyleFrTranslations } from "../Style.tr";
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
    Contact: contactFrTranslations,
    AccessesRequest: AccessesRequestFrTranslations,
    navItems: navItemsFrTranslations,
    datastoreNavItems: datastoreNavItemsFrTranslations,
    VectorDbListItem: VectorDbListItemFrTranslations,
    PyramidVectorListItem: PyramidVectorListItemFrTranslations,
    PyramidRasterListItem: PyramidRasterListItemFrTranslations,
    VectorDbList: VectorDbListFrTranslations,
    PyramidList: PyramidListFrTranslations,
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

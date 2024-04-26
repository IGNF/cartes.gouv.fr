import { datastoreNavItemsFrTranslations } from "../../config/datastoreNavItems";
import { navItemsFrTranslations } from "../../config/navItems";
import { TMSStyleFilesManagerFrTranslations } from "../../modules/Style/TMSStyleFilesManager";
import { AddMemberFrTranslations } from "../../entrepot/pages/communities/AddMember";
import { CommunityMembersFrTranslations } from "../../entrepot/pages/communities/CommunityMembers";
import { contactFrTranslations } from "../../pages/contact/Contact";
import { DashboardProFrTranslations } from "../../entrepot/pages/dashboard/DashboardPro";
import { PyramidListItemFrTranslations } from "../../entrepot/pages/datasheet/DatasheetView/DatasetListTab/PyramidList/PyramidListItem";
import { VectorDbListItemFrTranslations } from "../../entrepot/pages/datasheet/DatasheetView/DatasetListTab/VectorDbList/VectorDbListItem";
import { DatasheetViewFrTranslations } from "../../entrepot/pages/datasheet/DatasheetView/DatasheetView";
import { DatastorePermissionsFrTranslations } from "../../entrepot/pages/datastore/ManagePermissions/DatastorePermissionsTr";
import { DatastoreManageStorageFrTranslations } from "../../entrepot/pages/datastore/ManageStorage/DatastoreManageStorage";
import { TableSelectionFrTranslations } from "../../entrepot/pages/service/TableSelection";
import { MetadatasFormFrTranslations } from "../../entrepot/pages/service/metadatas/metadatas-form-tr";
import { ValidationMetadatasFrTranslations } from "../../entrepot/pages/service/metadatas/metadatas-validation-tr";
import { PyramidVectorTmsServiceFormFrTranslations } from "../../entrepot/pages/service/tms/PyramidVectorTmsServiceForm";
import { WfsServiceFormFrTranslations } from "../../entrepot/pages/service/wfs/WfsServiceForm";
import { UploadStyleFileFrTranslations } from "../../entrepot/pages/service/wms-vector/UploadStyleFile";
import { WmsVectorServiceFormFrTranslations } from "../../entrepot/pages/service/wms-vector/WmsVectorServiceForm";
import { MeFrTranslations } from "../../entrepot/pages/users/Me";
import { MyAccessKeysFrTranslations } from "../../entrepot/pages/users/MyAccessKeys";
import { UserKeyFrTranslations } from "../../entrepot/pages/users/keys/UserKeyTr";
import { UserKeysListTabFrTranslations } from "../../entrepot/pages/users/keys/UserKeysListTab";
import { PermissionsFrTranslations } from "../../entrepot/pages/users/permissions/PermissionsTr";
import { mapboxStyleValidationFrTranslations } from "../../validations/MapboxStyleValidator";
import { sldStyleValidationFrTranslations } from "../../validations/sldStyle";
import { commonFrTranslations } from "../Common";
import { RightsFrTranslations } from "../Rights";
import { StyleFrTranslations } from "../Style";
import type { Translations } from "../i18n";
import { EspaceCoCommunitiesFrTranslations } from "../../espaceco/pages/communities/EspaceCoCommunitiesTr";
import { DatasheetListFrTranslations } from "../../entrepot/pages/datasheet/DatasheetList/DatasheetList";

export const translations: Translations<"fr"> = {
    Common: commonFrTranslations,
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
    navItems: navItemsFrTranslations,
    datastoreNavItems: datastoreNavItemsFrTranslations,
    VectorDbListItem: VectorDbListItemFrTranslations,
    PyramidListItem: PyramidListItemFrTranslations,
    DatasheetView: DatasheetViewFrTranslations,
    sldStyleValidation: sldStyleValidationFrTranslations,
    mapboxStyleValidation: mapboxStyleValidationFrTranslations,
    TMSStyleFilesManager: TMSStyleFilesManagerFrTranslations,
    DatastoreManageStorage: DatastoreManageStorageFrTranslations,
    DatastorePermissions: DatastorePermissionsFrTranslations,
    WmsVectorServiceForm: WmsVectorServiceFormFrTranslations,
    WfsServiceForm: WfsServiceFormFrTranslations,
    TableSelection: TableSelectionFrTranslations,
    UploadStyleFile: UploadStyleFileFrTranslations,
    PyramidVectorTmsServiceForm: PyramidVectorTmsServiceFormFrTranslations,
    EspaceCoCommunities: EspaceCoCommunitiesFrTranslations,
    DatasheetList: DatasheetListFrTranslations,
};

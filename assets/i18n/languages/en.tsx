import { datastoreNavItemsEnTranslations } from "../../config/datastoreNavItems";
import { navItemsEnTranslations } from "../../config/navItems";
import { TMSStyleFilesManagerEnTranslations } from "../../modules/Style/TMSStyleFilesManager";
import { AddMemberEnTranslations } from "../../entrepot/pages/communities/AddMember";
import { CommunityMembersEnTranslations } from "../../entrepot/pages/communities/CommunityMembers";
import { contactEnTranslations } from "../../pages/contact/Contact";
import { DashboardProEnTranslations } from "../../entrepot/pages/dashboard/DashboardPro";
import { PyramidListItemFrTranslations } from "../../entrepot/pages/datasheet/DatasheetView/DatasetListTab/PyramidList/PyramidListItem";
import { VectorDbListItemEnTranslations } from "../../entrepot/pages/datasheet/DatasheetView/DatasetListTab/VectorDbList/VectorDbListItem";
import { DatasheetViewEnTranslations } from "../../entrepot/pages/datasheet/DatasheetView/DatasheetView";
import { DatastorePermissionsEnTranslations } from "../../entrepot/pages/datastore/ManagePermissions/DatastorePermissionsTr";
import { DatastoreManageStorageEnTranslations } from "../../entrepot/pages/datastore/ManageStorage/DatastoreManageStorage";
import { TableSelectionEnTranslations } from "../../entrepot/pages/service/TableSelection";
import { MetadatasFormEnTranslations } from "../../entrepot/pages/service/metadatas/metadatas-form-tr";
import { ValidationMetadatasEnTranslations } from "../../entrepot/pages/service/metadatas/metadatas-validation-tr";
import { PyramidVectorTmsServiceFormEnTranslations } from "../../entrepot/pages/service/tms/PyramidVectorTmsServiceForm";
import { WfsServiceFormEnTranslations } from "../../entrepot/pages/service/wfs/WfsServiceForm";
import { UploadStyleFileEnTranslations } from "../../entrepot/pages/service/wms-vector/UploadStyleFile";
import { WmsVectorServiceFormEnTranslations } from "../../entrepot/pages/service/wms-vector/WmsVectorServiceForm";
import { MeEnTranslations } from "../../entrepot/pages/users/Me";
import { MyAccessKeysEnTranslations } from "../../entrepot/pages/users/MyAccessKeys";
import { UserKeyEnTranslations } from "../../entrepot/pages/users/keys/UserKeyTr";
import { UserKeysListTabEnTranslations } from "../../entrepot/pages/users/keys/UserKeysListTab";
import { PermissionsEnTranslations } from "../../entrepot/pages/users/permissions/PermissionsTr";
import { mapboxStyleValidationEnTranslations } from "../../validations/MapboxStyleValidator";
import { sldStyleValidationEnTranslations } from "../../validations/sldStyle";
import { commonEnTranslations } from "../Common";
import { RightsEnTranslations } from "../Rights";
import { StyleEnTranslations } from "../Style";
import type { Translations } from "../i18n";

export const translations: Translations<"en"> = {
    Common: commonEnTranslations,
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
    navItems: navItemsEnTranslations,
    datastoreNavItems: datastoreNavItemsEnTranslations,
    VectorDbListItem: VectorDbListItemEnTranslations,
    PyramidListItem: PyramidListItemFrTranslations,
    DatasheetView: DatasheetViewEnTranslations,
    sldStyleValidation: sldStyleValidationEnTranslations,
    mapboxStyleValidation: mapboxStyleValidationEnTranslations,
    TMSStyleFilesManager: TMSStyleFilesManagerEnTranslations,
    DatastoreManageStorage: DatastoreManageStorageEnTranslations,
    DatastorePermissions: DatastorePermissionsEnTranslations,
    WmsVectorServiceForm: WmsVectorServiceFormEnTranslations,
    WfsServiceForm: WfsServiceFormEnTranslations,
    TableSelection: TableSelectionEnTranslations,
    UploadStyleFile: UploadStyleFileEnTranslations,
    PyramidVectorTmsServiceForm: PyramidVectorTmsServiceFormEnTranslations,
};

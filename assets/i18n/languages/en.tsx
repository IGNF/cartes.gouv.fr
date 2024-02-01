import { datastoreNavItemsEnTranslations } from "../../config/datastoreNavItems";
import { navItemsEnTranslations } from "../../config/navItems";
import { TMSStyleFilesManagerEnTranslations } from "../../modules/Style/TMSStyleFilesManager";
import { AddMemberEnTranslations } from "../../pages/communities/AddMember";
import { CommunityMembersEnTranslations } from "../../pages/communities/CommunityMembers";
import { contactEnTranslations } from "../../pages/contact/Contact";
import { PyramidListItemFrTranslations } from "../../pages/datasheet/DatasheetView/DatasetListTab/PyramidList/PyramidListItem";
import { VectorDbListItemEnTranslations } from "../../pages/datasheet/DatasheetView/DatasetListTab/VectorDbList/VectorDbListItem";
import { DatasheetViewEnTranslations } from "../../pages/datasheet/DatasheetView/DatasheetView";
import { DatastoreManageStorageEnTranslations } from "../../pages/datastore/DatastoreManageStorage/DatastoreManageStorage";
import { MetadatasFormEnTranslations } from "../../pages/service/metadatas/metadatas-form-tr";
import { ValidationMetadatasEnTranslations } from "../../pages/service/metadatas/metadatas-validation-tr";
import { MeEnTranslations } from "../../pages/users/Me";
import { MyAccessKeysEnTranslations } from "../../pages/users/MyAccessKeys";
import { UserKeyEnTranslations } from "../../pages/users/keys/UserKeyTr";
import { UserKeysListTabEnTranslations } from "../../pages/users/keys/UserKeysListTab";
import { PermissionsEnTranslations } from "../../pages/users/permissions/PermissionsTr";
import { mapboxStyleValidationEnTranslations } from "../../validations/MapboxStyleValidator";
import { sldStyleValidationEnTranslations } from "../../validations/sldStyle";
import { commonEnTranslations } from "../Common";
import { RightsEnTranslations } from "../Rights";
import { StyleEnTranslations } from "../Style";
import type { Translations } from "../i18n";
import { WmsVectorServiceFormEnTranslations } from "../../pages/service/wms-vector/WmsVectorServiceForm";
import { TableSelectionEnTranslations } from "../../pages/service/TableSelection";
import { UploadStyleFileEnTranslations } from "../../pages/service/wms-vector/UploadStyleFile";

export const translations: Translations<"en"> = {
    Common: commonEnTranslations,
    Rights: RightsEnTranslations,
    Style: StyleEnTranslations,
    Me: MeEnTranslations,
    AddMember: AddMemberEnTranslations,
    CommunityMembers: CommunityMembersEnTranslations,
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
    WmsVectorServiceForm: WmsVectorServiceFormEnTranslations,
    TableSelection: TableSelectionEnTranslations,
    UploadStyleFile: UploadStyleFileEnTranslations,
};

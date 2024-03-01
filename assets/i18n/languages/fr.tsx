import { datastoreNavItemsFrTranslations } from "../../config/datastoreNavItems";
import { navItemsFrTranslations } from "../../config/navItems";
import { TMSStyleFilesManagerFrTranslations } from "../../modules/Style/TMSStyleFilesManager";
import { AddMemberFrTranslations } from "../../pages/communities/AddMember";
import { CommunityMembersFrTranslations } from "../../pages/communities/CommunityMembers";
import { contactFrTranslations } from "../../pages/contact/Contact";
import { PyramidListItemFrTranslations } from "../../pages/datasheet/DatasheetView/DatasetListTab/PyramidList/PyramidListItem";
import { VectorDbListItemFrTranslations } from "../../pages/datasheet/DatasheetView/DatasetListTab/VectorDbList/VectorDbListItem";
import { DatasheetViewFrTranslations } from "../../pages/datasheet/DatasheetView/DatasheetView";
import { DatastoreManageStorageFrTranslations } from "../../pages/datastore/DatastoreManageStorage/DatastoreManageStorage";
import { MetadatasFormFrTranslations } from "../../pages/service/metadatas/metadatas-form-tr";
import { ValidationMetadatasFrTranslations } from "../../pages/service/metadatas/metadatas-validation-tr";
import { MeFrTranslations } from "../../pages/users/Me";
import { MyAccessKeysFrTranslations } from "../../pages/users/MyAccessKeys";
import { AccessKeysListTabFrTranslations } from "../../pages/users/keys/AccessKeysListTab";
import { AddAccessKeyFrTranslations } from "../../pages/users/keys/AddAccessKeyTr";
import { PermissionsFrTranslations } from "../../pages/users/permissions/PermissionsTr";
import { mapboxStyleValidationFrTranslations } from "../../validations/MapboxStyleValidator";
import { sldStyleValidationFrTranslations } from "../../validations/sldStyle";
import { commonFrTranslations } from "../Common";
import { RightsFrTranslations } from "../Rights";
import { StyleFrTranslations } from "../Style";
import type { Translations } from "../i18n";

export const translations: Translations<"fr"> = {
    Common: commonFrTranslations,
    Rights: RightsFrTranslations,
    Style: StyleFrTranslations,
    Me: MeFrTranslations,
    AddMember: AddMemberFrTranslations,
    CommunityMembers: CommunityMembersFrTranslations,
    MyAccessKeys: MyAccessKeysFrTranslations,
    AddAccessKey: AddAccessKeyFrTranslations,
    AccessKeysListTab: AccessKeysListTabFrTranslations,
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
};

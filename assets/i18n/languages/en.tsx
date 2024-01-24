import type { Translations } from "../i18n";
import { commonEnTranslations } from "../Common";
import { RightsEnTranslations } from "../Rights";
import { StyleEnTranslations } from "../Style";
import { CommunityMembersEnTranslations } from "../../pages/communities/CommunityMembers";
import { AddMemberEnTranslations } from "../../pages/communities/AddMember";
import { ValidationMetadatasEnTranslations } from "../../pages/service/metadatas/metadatas-validation-tr";
import { navItemsEnTranslations } from "../../config/navItems";
import { datastoreNavItemsEnTranslations } from "../../config/datastoreNavItems";
import { contactEnTranslations } from "../../pages/contact/Contact";
import { DatasheetViewEnTranslations } from "../../pages/datasheet/DatasheetView/DatasheetView";
import { sldStyleValidationEnTranslations } from "../../validations/sldStyle";
import { mapboxStyleValidationEnTranslations } from "../../validations/MapboxStyleValidator";
import { TMSStyleFilesManagerEnTranslations } from "../../modules/Style/TMSStyleFilesManager";
import { DatastoreManageStorageEnTranslations } from "../../pages/datastore/DatastoreManageStorage/DatastoreManageStorage";
import { VectorDbListItemEnTranslations } from "../../pages/datasheet/DatasheetView/DatasetListTab/VectorDbList/VectorDbListItem";
import { PyramidListItemFrTranslations } from "../../pages/datasheet/DatasheetView/DatasetListTab/PyramidList/PyramidListItem";

export const translations: Translations<"en"> = {
    Common: commonEnTranslations,
    Rights: RightsEnTranslations,
    Style: StyleEnTranslations,
    AddMember: AddMemberEnTranslations,
    CommunityMembers: CommunityMembersEnTranslations,
    ValidationMetadatas: ValidationMetadatasEnTranslations,
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
};

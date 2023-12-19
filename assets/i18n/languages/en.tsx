import type { Translations } from "../i18n";
import { commonEnTranslations } from "../Common";
import { RightsEnTranslations } from "../Rights";
import { CommunityMembersEnTranslations } from "../../pages/communities/CommunityMembers";
import { AddMemberEnTranslations } from "../../pages/communities/AddMember";
import { ValidationMetadatasEnTranslations } from "../../pages/service/metadatas/metadatas-validation-tr";
import { navItemsEnTranslations } from "../../config/navItems";
import { datastoreNavItemsEnTranslations } from "../../config/datastoreNavItems";
import { contactEnTranslations } from "../../pages/contact/Contact";
import { DatasheetViewEnTranslations } from "../../pages/datasheet/DatasheetView/DatasheetView";
import { sldStyleValidationEnTranslations } from "../../validations/sldStyle";
import { DatastoreManageStorageEnTranslations } from "../../pages/datastore/DatastoreManageStorage/DatastoreManageStorage";

export const translations: Translations<"en"> = {
    Common: commonEnTranslations,
    Rights: RightsEnTranslations,
    AddMember: AddMemberEnTranslations,
    CommunityMembers: CommunityMembersEnTranslations,
    ValidationMetadatas: ValidationMetadatasEnTranslations,
    Contact: contactEnTranslations,
    navItems: navItemsEnTranslations,
    datastoreNavItems: datastoreNavItemsEnTranslations,
    DatasheetView: DatasheetViewEnTranslations,
    sldStyleValidation: sldStyleValidationEnTranslations,
    DatastoreManageStorage: DatastoreManageStorageEnTranslations,
};

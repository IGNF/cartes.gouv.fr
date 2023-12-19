import type { Translations } from "../i18n";
import { commonFrTranslations } from "../Common";
import { RightsFrTranslations } from "../Rights";
import { AddMemberFrTranslations } from "../../pages/communities/AddMember";
import { CommunityMembersFrTranslations } from "../../pages/communities/CommunityMembers";
import { ValidationMetadatasFrTranslations } from "../../pages/service/metadatas/metadatas-validation-tr";
import { navItemsFrTranslations } from "../../config/navItems";
import { datastoreNavItemsFrTranslations } from "../../config/datastoreNavItems";
import { contactFrTranslations } from "../../pages/contact/Contact";
import { DatasheetViewFrTranslations } from "../../pages/datasheet/DatasheetView/DatasheetView";
import { sldStyleValidationFrTranslations } from "../../validations/sldStyle";
import { DatastoreManageStorageFrTranslations } from "../../pages/datastore/DatastoreManageStorage/DatastoreManageStorage";

export const translations: Translations<"fr"> = {
    Common: commonFrTranslations,
    Rights: RightsFrTranslations,
    AddMember: AddMemberFrTranslations,
    CommunityMembers: CommunityMembersFrTranslations,
    ValidationMetadatas: ValidationMetadatasFrTranslations,
    Contact: contactFrTranslations,
    navItems: navItemsFrTranslations,
    datastoreNavItems: datastoreNavItemsFrTranslations,
    DatasheetView: DatasheetViewFrTranslations,
    sldStyleValidation: sldStyleValidationFrTranslations,
    DatastoreManageStorage: DatastoreManageStorageFrTranslations,
};

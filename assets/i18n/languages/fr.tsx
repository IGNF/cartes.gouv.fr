import type { Translations } from "../i18n";
import { commonFrTranslations } from "../Common";
import { RightsFrTranslations } from "../Rights";
import { StyleFrTranslations } from "../Style";
import { AddMemberFrTranslations } from "../../pages/communities/AddMember";
import { CommunityMembersFrTranslations } from "../../pages/communities/CommunityMembers";
import { ValidationMetadatasFrTranslations } from "../../pages/service/metadatas/metadatas-validation-tr";
import { navItemsFrTranslations } from "../../config/navItems";
import { datastoreNavItemsFrTranslations } from "../../config/datastoreNavItems";
import { contactFrTranslations } from "../../pages/contact/Contact";
import { DatasheetViewFrTranslations } from "../../pages/datasheet/DatasheetView/DatasheetView";
import { sldStyleValidationFrTranslations } from "../../validations/sldStyle";
import { mapboxStyleValidationFrTranslations } from "../../validations/MapboxStyleValidator";
import { TMSStyleFilesManagerFrTranslations } from "../../modules/Style/TMSStyleFilesManager";
import { DatastoreManageStorageFrTranslations } from "../../pages/datastore/DatastoreManageStorage/DatastoreManageStorage";

export const translations: Translations<"fr"> = {
    Common: commonFrTranslations,
    Rights: RightsFrTranslations,
    Style: StyleFrTranslations,
    AddMember: AddMemberFrTranslations,
    CommunityMembers: CommunityMembersFrTranslations,
    ValidationMetadatas: ValidationMetadatasFrTranslations,
    Contact: contactFrTranslations,
    navItems: navItemsFrTranslations,
    datastoreNavItems: datastoreNavItemsFrTranslations,
    DatasheetView: DatasheetViewFrTranslations,
    sldStyleValidation: sldStyleValidationFrTranslations,
    mapboxStyleValidation: mapboxStyleValidationFrTranslations,
    TMSStyleFilesManager: TMSStyleFilesManagerFrTranslations,
    DatastoreManageStorage: DatastoreManageStorageFrTranslations,
};

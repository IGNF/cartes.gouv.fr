import type { Translations } from "../i18n";
import { commonEnTranslations } from "../Common";
import { ValidationMetadatasEnTranslations } from "../../pages/service/metadatas/metadatas-validation-tr";
import { navItemsEnTranslations } from "../../config/navItems";
import { datastoreNavItemsEnTranslations } from "../../config/datastoreNavItems";
import { contactEnTranslations } from "../../pages/contact/Contact";
import { DatasheetViewEnTranslations } from "../../pages/datasheet/DatasheetView/DatasheetView";
import { sldStyleValidationEnTranslations } from "../../validations/sldStyle";

export const translations: Translations<"en"> = {
    Common: commonEnTranslations,
    ValidationMetadatas: ValidationMetadatasEnTranslations,
    Contact: contactEnTranslations,
    navItems: navItemsEnTranslations,
    datastoreNavItems: datastoreNavItemsEnTranslations,
    DatasheetView: DatasheetViewEnTranslations,
    sldStyleValidation: sldStyleValidationEnTranslations,
};

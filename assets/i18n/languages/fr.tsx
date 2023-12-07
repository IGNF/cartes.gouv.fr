import type { Translations } from "../i18n";
import { commonFrTranslations } from "../Common";
import { ValidationMetadatasFrTranslations } from "../../pages/service/metadatas/metadatas-validation-tr";
import { navItemsFrTranslations } from "../../config/navItems";
import { datastoreNavItemsFrTranslations } from "../../config/datastoreNavItems";
import { contactFrTranslations } from "../../pages/contact/Contact";
import { DatasheetViewFrTranslations } from "../../pages/datasheet/DatasheetView/DatasheetView";
import { sldStyleValidationFrTranslations } from "../../validations/sldStyle";

export const translations: Translations<"fr"> = {
    Common: commonFrTranslations,
    ValidationMetadatas: ValidationMetadatasFrTranslations,
    Contact: contactFrTranslations,
    navItems: navItemsFrTranslations,
    datastoreNavItems: datastoreNavItemsFrTranslations,
    DatasheetView: DatasheetViewFrTranslations,
    sldStyleValidation: sldStyleValidationFrTranslations,
};

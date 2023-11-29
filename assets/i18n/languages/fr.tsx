import type { Translations } from "../i18n";
import { commonFrTranslations } from "../Common";
import { ValidationMetadatasFrTranslations } from "../../pages/service/metadatas/metadatas-validation-tr";
import { navItemsFrTranslations } from "../../config/navItems";
import { contactFrTranslations } from "../../pages/contact/Contact";
import { AddStyleFormFrTranslations } from "../../components/AddStyleForm/AddStyleForm";
import { DatasheetViewFrTranslations } from "../../pages/datasheet/DatasheetView/DatasheetView";
import { sldStyleValidationFrTranslations } from "../../validations/sldStyle";

export const translations: Translations<"fr"> = {
    Common: commonFrTranslations,
    ValidationMetadatas: ValidationMetadatasFrTranslations,
    Contact: contactFrTranslations,
    navItems: navItemsFrTranslations,
    AddStyleForm: AddStyleFormFrTranslations,
    DatasheetView: DatasheetViewFrTranslations,
    sldStyleValidation: sldStyleValidationFrTranslations,
};

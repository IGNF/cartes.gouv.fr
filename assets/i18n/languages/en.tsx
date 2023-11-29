import type { Translations } from "../i18n";
import { commonEnTranslations } from "../Common";
import { ValidationMetadatasEnTranslations } from "../../pages/service/metadatas/metadatas-validation-tr";
import { navItemsEnTranslations } from "../../config/navItems";
import { contactEnTranslations } from "../../pages/contact/Contact";
import { AddStyleFormEnTranslations } from "../../components/AddStyleForm/AddStyleForm";
import { DatasheetViewEnTranslations } from "../../pages/datasheet/DatasheetView/DatasheetView";
import { sldStyleValidationEnTranslations } from "../../validations/sldStyle";

export const translations: Translations<"en"> = {
    Common: commonEnTranslations,
    ValidationMetadatas: ValidationMetadatasEnTranslations,
    Contact: contactEnTranslations,
    navItems: navItemsEnTranslations,
    AddStyleForm: AddStyleFormEnTranslations,
    DatasheetView: DatasheetViewEnTranslations,
    sldStyleValidation: sldStyleValidationEnTranslations,
};

import type { Translations } from "../i18n";
import { commonEnTranslations } from "../Common";
import { navItemsEnTranslations } from "../../config/navItems";
import { contactEnTranslations } from "../../pages/contact/Contact";
import { AddStyleFormEnTranslations } from "../../components/AddStyleForm/AddStyleForm";
import { DatasheetViewEnTranslations } from "../../pages/datasheet/DatasheetView/DatasheetView";

export const translations: Translations<"en"> = {
    Common: commonEnTranslations,
    Contact: contactEnTranslations,
    navItems: navItemsEnTranslations,
    AddStyleForm: AddStyleFormEnTranslations,
    DatasheetView: DatasheetViewEnTranslations,
};

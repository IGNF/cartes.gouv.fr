import type { Translations } from "../i18n";
import { navItemsEnTranslations } from "../../config/navItems";
import { contactEnTranslations } from "../../pages/contact/Contact";
import { AddStyleFormEnTranslations } from "../../components/AddStyleForm/AddStyleForm";

export const translations: Translations<"en"> = {
    Contact: contactEnTranslations,
    navItems: navItemsEnTranslations,
    AddStyleForm: AddStyleFormEnTranslations,
};

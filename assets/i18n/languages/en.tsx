import type { Translations } from "..";
import { navItemsEnTranslations } from "../../config/navItems";
import { contactEnTranslations } from "../../pages/contact/Contact";

export const translations: Translations<"en"> = {
    Contact: contactEnTranslations,
    navItems: navItemsEnTranslations,
};

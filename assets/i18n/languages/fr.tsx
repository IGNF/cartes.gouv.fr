import type { Translations } from "..";
import { navItemsFrTranslations } from "../../config/navItems";
import { contactFrTranslations } from "../../pages/contact/Contact";

export const translations: Translations<"fr"> = {
    Contact: contactFrTranslations,
    navItems: navItemsFrTranslations,
};

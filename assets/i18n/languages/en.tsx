import type { Translations } from "..";

import { enTranslations as navItemsTranslations } from "../../config/navItems";
import { enTranslations as contactTranslations } from "../../pages/contact/Contact";

export const translations: Translations<"en"> = {
    Contact: contactTranslations,
    navItems: navItemsTranslations,
};

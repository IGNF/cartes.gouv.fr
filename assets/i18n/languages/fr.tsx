import type { Translations } from "..";

import { frTranslations as navItemsTranslations } from "../../config/navItems";
import { frTranslations as contactTranslations } from "../../pages/contact/Contact";

export const translations: Translations<"fr"> = {
    Contact: contactTranslations,
    navItems: navItemsTranslations,
};

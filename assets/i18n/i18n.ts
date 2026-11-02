import { createI18nApi, declareComponentKeys } from "i18nifty";

import { ComponentKey, fallbackLanguage, languages } from "./types";

export { declareComponentKeys };

export type LocalizedString = Parameters<typeof resolveLocalizedString>[0];

/** initialisation de l'instance de i18n */
// oxlint-disable-next-line typescript/unbound-method -- fonctions i18nifty sans this, déstructurables
export const { useTranslation, resolveLocalizedString, useLang, $lang, $readyLang, useResolveLocalizedString, getTranslation } = createI18nApi<ComponentKey>()(
    { languages, fallbackLanguage },
    {
        en: () => import("./languages/en").then(({ translations }) => translations),
        fr: () => import("./languages/fr").then(({ translations }) => translations),
    }
);

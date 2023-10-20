import { createI18nApi, declareComponentKeys } from "i18nifty";
import { ComponentKey, fallbackLanguage, languages } from "./types";
export { declareComponentKeys };

export type LocalizedString = Parameters<typeof resolveLocalizedString>[0];

export const { useTranslation, resolveLocalizedString, useLang, $lang, useResolveLocalizedString, useIsI18nFetching } = createI18nApi<ComponentKey>()(
    { languages, fallbackLanguage },
    {
        en: () => import("./resources/en").then(({ translations }) => translations),
        fr: () => import("./resources/fr").then(({ translations }) => translations),
    }
);

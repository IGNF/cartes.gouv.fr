import { TranslationFunction } from "i18nifty/typeUtils/TranslationFunction";

import { ComponentKey, Translations, declareComponentKeys } from "../i18n/i18n";
import { routes } from "../router/router";

export const defaultNavItems = (t: TranslationFunction<"navItems", ComponentKey>) => [
    {
        menuLinks: [
            {
                linkProps: routes.documentation().link,
                text: t("documentation"),
            },
            {
                linkProps: routes.faq().link,
                text: t("faq"),
            },
            {
                linkProps: routes.contact().link,
                text: t("nous écrire"),
            },
        ],
        text: t("start"),
    },
    {
        text: t("news"),
        linkProps: routes.news_list().link,
    },
    {
        text: t("about"),
        linkProps: routes.about().link,
    },
];

// traductions
export const { i18n } = declareComponentKeys<"documentation" | "faq" | "nous écrire" | "start" | "news" | "about">()("navItems");

export const navItemsFrTranslations: Translations<"fr">["navItems"] = {
    "nous écrire": "Nous écrire",
    documentation: "Documentation Géoplateforme",
    faq: "Questions fréquentes",
    start: "Commencer avec cartes.gouv",
    news: "Actualités",
    about: "À propos",
};

export const navItemsEnTranslations: Translations<"en">["navItems"] = {
    "nous écrire": "Contact us",
    documentation: undefined,
    faq: "Frequently asked questions",
    start: "Start with cartes.gouv",
    news: "News",
    about: "About",
};

import { TranslationFunction } from "i18nifty/typeUtils/TranslationFunction";

import { ComponentKey, Translations, declareComponentKeys } from "../i18n";
import { routes } from "../router/router";

export const defaultNavItems = (t: TranslationFunction<"navItems", ComponentKey>) => [
    {
        menuLinks: [
            {
                linkProps: {
                    href: "https://geoservices.ign.fr/bascule-vers-la-geoplateforme",
                    target: "_blank",
                    title: "bascule vers la géoplateforme - ouvre une nouvelle fenêtre",
                },
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
        text: "Commencer avec cartes.gouv",
    },
    {
        text: "Actualités",
        linkProps: routes.news_list().link,
    },
    {
        text: "A propos",
        linkProps: routes.about().link,
    },
];

// traductions
export const { i18n } = declareComponentKeys<"documentation" | "faq" | "nous écrire">()("navItems");

export const frTranslations: Translations<"fr">["navItems"] = {
    "nous écrire": "Nous écrire",
    documentation: "Documentation",
    faq: "Questions fréquentes",
};

export const enTranslations: Translations<"en">["navItems"] = {
    "nous écrire": undefined,
    documentation: undefined,
    faq: undefined,
};

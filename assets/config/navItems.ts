import { TranslationFunction } from "i18nifty/typeUtils/TranslationFunction";
import { MainNavigationProps } from "@codegouvfr/react-dsfr/MainNavigation";

import { ComponentKey, Translations, declareComponentKeys } from "../i18n/i18n";
import { routes } from "../router/router";

// dans ce cas précise, getTranslation ne marche pas parce que les traductions sont pas encore chargées, on est donc obglié de passer la fonction t en paramètre
export const defaultNavItems = (t: TranslationFunction<"navItems", ComponentKey>): MainNavigationProps.Item[] => {
    const navItems: MainNavigationProps.Item[] = [
        {
            menuLinks: [
                {
                    linkProps: routes.documentation().link,
                    text: t("documentation"),
                },
                {
                    linkProps: routes.offer().link,
                    text: t("offer"),
                },
                {
                    linkProps: routes.join().link,
                    text: t("join"),
                },
            ],
            text: t("start"),
        },
        {
            text: t("catalog"),
            linkProps: { href: "#" },
        },
        {
            text: t("maps"),
            linkProps: { href: "#" },
        },
        {
            text: t("news"),
            linkProps: routes.news_list().link,
        },
        {
            menuLinks: [
                {
                    linkProps: routes.faq().link,
                    text: t("faq"),
                },
                {
                    linkProps: routes.contact().link,
                    text: t("nous écrire"),
                },
                {
                    linkProps: routes.service_status().link,
                    text: t("service status"),
                },
            ],
            text: t("assistance"),
        },
        {
            text: t("about"),
            linkProps: routes.about().link,
        },
    ];

    return navItems;
};

// traductions
export const { i18n } = declareComponentKeys<
    "documentation" | "offer" | "join" | "faq" | "nous écrire" | "start" | "maps" | "catalog" | "news" | "assistance" | "service status" | "about"
>()("navItems");

export const navItemsFrTranslations: Translations<"fr">["navItems"] = {
    "nous écrire": "Nous écrire",
    documentation: "Documentation",
    offer: "Offre",
    join: "Nous rejoindre",
    faq: "Questions fréquentes",
    start: "Commencer avec cartes.gouv",
    catalog: "Catalogue",
    maps: "Cartes",
    news: "Actualités",
    assistance: "Assistance",
    "service status": "Niveau de service",
    about: "À propos",
};

export const navItemsEnTranslations: Translations<"en">["navItems"] = {
    "nous écrire": "Contact us",
    documentation: "Documentation",
    offer: "Offer",
    join: "Join us",
    faq: "Frequently asked questions",
    start: "Start with cartes.gouv",
    catalog: "Catalog",
    maps: "Maps",
    news: "News",
    assistance: "Assistance",
    "service status": "Level of service",
    about: "About",
};

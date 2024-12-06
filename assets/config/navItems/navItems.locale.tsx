import { declareComponentKeys } from "i18nifty";

import { Translations } from "../../i18n/types";

const { i18n } = declareComponentKeys<
    "documentation" | "offer" | "join" | "faq" | "nous écrire" | "start" | "maps" | "catalog" | "news" | "assistance" | "service status" | "about"
>()("navItems");
export type I18n = typeof i18n;

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

import { Translations, declareComponentKeys } from "./i18n";

export const { i18n } = declareComponentKeys<"about" | "contact" | "contact_thanks" | "news" | "faq" | "sitemap">()("Breadcrumb");

export const BreadcrumbFrTranslations: Translations<"fr">["Breadcrumb"] = {
    about: "A propos",
    contact: "Nous écrire",
    contact_thanks: "Demande envoyée",
    news: "Actualités",
    faq: "Questions fréquentes",
    sitemap: "Plan du site",
};

export const BreadcrumbEnTranslations: Translations<"en">["Breadcrumb"] = {
    about: "About",
    contact: "Contact us",
    contact_thanks: "Request sent",
    news: "News",
    faq: "frequently asked questions",
    sitemap: "Sitemap",
};

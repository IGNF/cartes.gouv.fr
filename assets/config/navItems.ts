import { TranslationFunction } from "i18nifty/typeUtils/TranslationFunction";
import { MainNavigationProps } from "@codegouvfr/react-dsfr/MainNavigation";

import { ComponentKey, Translations, declareComponentKeys } from "../i18n/i18n";
import { routes } from "../router/router";
import { useAuthStore } from "../stores/AuthStore";

// dans ce cas précise, getTranslation ne marche pas parce que les traductions sont pas encore chargées, on est donc obglié de passer la fonction t en paramètre
export const defaultNavItems = (t: TranslationFunction<"navItems", ComponentKey>): MainNavigationProps.Item[] => {
    const user = useAuthStore.getState().user;

    const navItems: MainNavigationProps.Item[] = [
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

    if (user !== null) {
        navItems.push({
            text: t("my_account"),
            linkProps: routes.my_account().link,
        });
        navItems.push({
            text: t("my_access_keys"),
            linkProps: routes.my_access_keys().link,
        });
    }

    return navItems;
};

// traductions
export const { i18n } = declareComponentKeys<"documentation" | "faq" | "nous écrire" | "start" | "news" | "about" | "my_account" | "my_access_keys">()(
    "navItems"
);

export const navItemsFrTranslations: Translations<"fr">["navItems"] = {
    "nous écrire": "Nous écrire",
    documentation: "Documentation Géoplateforme",
    faq: "Questions fréquentes",
    start: "Commencer avec cartes.gouv",
    news: "Actualités",
    about: "À propos",
    my_account: "Mon compte",
    my_access_keys: "Mes clés d'accès",
};

export const navItemsEnTranslations: Translations<"en">["navItems"] = {
    "nous écrire": "Contact us",
    documentation: undefined,
    faq: "Frequently asked questions",
    start: "Start with cartes.gouv",
    news: "News",
    about: "About",
    my_account: undefined,
    my_access_keys: undefined,
};

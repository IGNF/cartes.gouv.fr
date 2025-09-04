import { MainNavigationProps } from "@codegouvfr/react-dsfr/MainNavigation";
import { TranslationFunction } from "i18nifty/typeUtils/TranslationFunction";

import { catalogueUrl } from "@/env";
import { ComponentKey } from "../../i18n/types";
import { appRoot, routes } from "../../router/router";
import { assistanceNavItems } from "./assistanceNavItems";

// dans ce cas précise, getTranslation ne marche pas parce que les traductions sont pas encore chargées, on est donc obglié de passer la fonction t en paramètre
export const defaultNavItems = (t: TranslationFunction<"navItems", ComponentKey>): MainNavigationProps.Item[] => {
    const navItems: MainNavigationProps.Item[] = [
        {
            menuLinks: [
                {
                    linkProps: { href: appRoot + "/documentation/" },
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
            linkProps: { href: catalogueUrl ?? appRoot + "/catalogue" },
        },
        {
            text: t("maps"),
            linkProps: { href: appRoot + "/cartes" },
        },
        {
            text: t("news"),
            linkProps: routes.news_list().link,
        },
        assistanceNavItems(t),
        {
            text: t("about"),
            linkProps: routes.about().link,
        },
    ];

    return navItems;
};

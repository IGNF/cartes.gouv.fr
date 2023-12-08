import { type MainNavigationProps } from "@codegouvfr/react-dsfr/MainNavigation/MainNavigation";
import { declareComponentKeys } from "i18nifty";

import { Translations, getTranslation } from "../i18n/i18n";
import { routes } from "../router/router";
import { Datastore } from "../types/app";

const { t } = getTranslation("datastoreNavItems");

export const datastoreNavItems = (datastoreList: Datastore[] = [], currentDatastore?: Datastore): MainNavigationProps.Item[] => {
    const navItems: MainNavigationProps.Item[] = [
        {
            text: t("dashboard"),
            linkProps: routes.dashboard_pro().link,
        },
        // {
        //     text: "Visualisation",
        //     linkProps: {
        //         href: "#",
        //     },
        // },
        // {
        //     text: "Outils & Traitements",
        //     linkProps: {
        //         href: "#",
        //     },
        // },
        // {
        //     text: "Collaboration",
        //     linkProps: {
        //         href: "#",
        //     },
        // },
        // {
        //     text: "Portails",
        //     linkProps: {
        //         href: "#",
        //     },
        // },
        // {
        //     text: "Utilisateurs & Groupes",
        //     linkProps: {
        //         href: "#",
        //     },
        // },
    ];

    if (currentDatastore !== undefined) {
        navItems.push({
            text: t("data"),
            linkProps: routes.datasheet_list({ datastoreId: currentDatastore._id }).link,
        });
    }

    if (datastoreList.length > 0) {
        const datastoreLinks: MainNavigationProps.Item.Menu = {
            text: currentDatastore?.name ?? t("choose datastore"),
            menuLinks:
                datastoreList?.map((datastore) => ({
                    linkProps: routes.datasheet_list({ datastoreId: datastore._id }).link,
                    text: datastore.name,
                    isActive: datastore._id === currentDatastore?._id,
                })) || [],
        };

        datastoreLinks.menuLinks.push({
            text: t("title"),
            linkProps: routes.datastore_create_request().link,
        });
        navItems.push(datastoreLinks);
    }

    return navItems;
};

// traductions
export const { i18n } = declareComponentKeys<"dashboard" | "data" | "choose datastore" | "title">()("datastoreNavItems");

export const datastoreNavItemsFrTranslations: Translations<"fr">["datastoreNavItems"] = {
    dashboard: "Tableau de bord",
    data: "Données",
    "choose datastore": "Choisir un espace de travail",
    title: "Demande de création d'un espace de travail",
};

export const datastoreNavItemsEnTranslations: Translations<"en">["datastoreNavItems"] = {
    dashboard: undefined,
    data: undefined,
    "choose datastore": undefined,
    title: undefined,
};

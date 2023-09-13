import { type MainNavigationProps } from "@codegouvfr/react-dsfr/MainNavigation/MainNavigation";

import { routes } from "../router/router";
import { Datastore } from "../types/app";
import Translator from "../modules/Translator";

export const datastoreNavItems = (datastoreList: Datastore[] = [], datastore?: Datastore): MainNavigationProps.Item[] => {
    const navItems: MainNavigationProps.Item[] = [
        {
            text: "Tableau de bord",
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

    if (datastore !== undefined) {
        navItems.push({
            text: "Données",
            linkProps: routes.datasheet_list({ datastoreId: datastore._id }).link,
        });
    }

    if (datastoreList.length > 0) {
        const datastoreLinks: MainNavigationProps.Item.Menu = {
            text: datastore?.name ?? "Choisir un espace de travail",
            menuLinks:
                datastoreList?.map((datastore) => ({
                    linkProps: routes.datasheet_list({ datastoreId: datastore._id }).link,
                    text: datastore.name,
                    isActive: datastore._id === datastore?._id,
                })) || [],
        };

        datastoreLinks.menuLinks.push({
            text: Translator.trans("datastore_creation_request.title"),
            linkProps: routes.datastore_create_request().link,
        });
        navItems.push(datastoreLinks);
    }

    return navItems;
};

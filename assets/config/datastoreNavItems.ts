import { type MainNavigationProps } from "@codegouvfr/react-dsfr/MainNavigation/MainNavigation";

import { routes } from "../router/router";

export const datastoreNavItems = (datastoreId: string): MainNavigationProps.Item[] => [
    {
        text: "Tableau de bord",
        linkProps: routes.dashboard_pro().link,
    },
    {
        menuLinks: [
            {
                linkProps: routes.datasheet_list({ datastoreId }).link,
                text: "Données",
            },
            {
                linkProps: {
                    href: "#",
                },
                text: "Standards",
            },
        ],
        text: "Données",
    },
    {
        text: "Visualisation",
        linkProps: {
            href: "#",
        },
    },
    {
        text: "Outils & Traitements",
        linkProps: {
            href: "#",
        },
    },
    {
        text: "Collaboration",
        linkProps: {
            href: "#",
        },
    },
    {
        text: "Portails",
        linkProps: {
            href: "#",
        },
    },
    {
        text: "Utilisateurs & Groupes",
        linkProps: {
            href: "#",
        },
    },
];

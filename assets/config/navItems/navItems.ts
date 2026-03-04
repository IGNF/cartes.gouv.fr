import { MainNavigationProps } from "@codegouvfr/react-dsfr/MainNavigation";

import { externalUrls } from "@/router/externalUrls";

export const defaultNavItems = (): MainNavigationProps.Item[] => {
    const navItems: MainNavigationProps.Item[] = [
        {
            text: "Découvrir cartes.gouv.fr",
            linkProps: {
                href: externalUrls.discover_cartesgouvfr,
            },
        },
        {
            menuLinks: [
                {
                    linkProps: {
                        href: externalUrls.present_service_maps,
                    },
                    text: "Explorer les cartes",
                },
                {
                    linkProps: {
                        href: externalUrls.present_service_catalogue,
                    },
                    text: "Rechercher une donnée",
                },
                {
                    linkProps: {
                        href: externalUrls.present_service_publish,
                    },
                    text: "Publier une donnée",
                },
            ],
            text: "Services",
        },
        {
            text: "Offres",
            linkProps: {
                href: externalUrls.offers,
            },
        },
        {
            text: "Actualités",
            linkProps: {
                href: externalUrls.news_list,
            },
        },
        {
            text: "Communautés",
            linkProps: {
                href: externalUrls.join_cartesgouvfr_community,
            },
        },
        {
            linkProps: {
                href: externalUrls.service_status,
            },
            text: "Niveau de service",
        },
    ];

    return navItems;
};

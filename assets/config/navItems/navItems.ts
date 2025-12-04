import { MainNavigationProps } from "@codegouvfr/react-dsfr/MainNavigation";

import { externalUrls } from "@/router/externalUrls";
import { routes } from "../../router/router";

// dans ce cas précise, getTranslation ne marche pas parce que les traductions sont pas encore chargées, on est donc obglié de passer la fonction t en paramètre
export const defaultNavItems = (routeName: string): MainNavigationProps.Item[] => {
    const navItems: MainNavigationProps.Item[] = [
        {
            text: "Découvrir cartes.gouv.fr",
            linkProps: routes.discover().link,
            isActive: routeName === routes.discover().name,
        },
        {
            menuLinks: [
                {
                    linkProps: { href: externalUrls.maps },
                    text: "Explorer les cartes",
                },
                {
                    linkProps: { href: externalUrls.catalogue },
                    text: "Rechercher une donnée",
                },
                {
                    linkProps: routes.discover_publish().link,
                    text: "Publier une donnée",
                    isActive: routeName === routes.discover_publish().name,
                },
            ],
            text: "Services",
        },
        {
            text: "Offres",
            linkProps: routes.offer().link,
            isActive: routeName === routes.offer().name,
        },
        {
            text: "Actualités",
            linkProps: routes.news_list().link,
            isActive: routeName === routes.news_list().name,
        },
        {
            text: "Communautés",
            linkProps: routes.join().link,
            isActive: routeName === routes.join().name,
        },
        {
            linkProps: routes.service_status().link,
            text: "Niveau de service",
            isActive: routeName === routes.service_status().name,
        },
    ];

    return navItems;
};

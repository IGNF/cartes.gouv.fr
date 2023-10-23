import { routes } from "../router/router";

export const defaultNavItems = [
    {
        menuLinks: [
            {
                linkProps: {
                    href: "https://geoservices.ign.fr/bascule-vers-la-geoplateforme",
                    target: "_blank",
                    title: "bascule vers la géoplateforme - ouvre une nouvelle fenêtre"
                },
                text: "Documentation",
            },
            {
                linkProps: routes.faq().link,
                text: "Questions fréquentes",
            },
            {
                linkProps: routes.contact().link,
                text: "Nous écrire",
            },
        ],
        text: "Commencer avec cartes.gouv",
    },
    {
        text: "Actualités",
        linkProps: routes.news_list().link,
    },
    {
        text: "A propos",
        linkProps: routes.about().link,
    },
];

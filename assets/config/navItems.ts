import { routes } from "../router/router";

export const defaultNavItems = [
    {
        menuLinks: [
            // {
            //     linkProps: "#",
            //     text: "Je veux...",
            // },
            {
                linkProps: routes.docs().link,
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
    // {
    //     menuLinks: [
    //         {
    //             linkProps: "#",
    //             text: "Données",
    //         },
    //         {
    //             linkProps: "#",
    //             text: "Services",
    //         },
    //     ],
    //     text: "Catalogue",
    // },
    // {
    //     menuLinks: [
    //         {
    //             linkProps: "#",
    //             text: "Gitlab Géoplateforme",
    //         },
    //         {
    //             linkProps: "#",
    //             text: "Bac à sable de développement",
    //         },
    //     ],
    //     text: "Usine logicielle",
    // },
    {
        text: "Actualités",
        linkProps: routes.news_list().link,
    },
    {
        text: "A propos",
        linkProps: routes.about().link,
    },
];

import { routes } from "../router/router";

export const defaultNavItems = [
    {
        menuLinks: [
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
    {
        text: "Actualités",
        linkProps: routes.news_list().link,
    },
    {
        text: "A propos",
        linkProps: routes.about().link,
    },
];

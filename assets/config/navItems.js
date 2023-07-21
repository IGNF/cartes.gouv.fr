import { routes } from "../router/router";

export const defaultNavItems = [
    {
        text: "Données et services",
        linkProps: {
            href: "#",
        },
    },
    {
        text: "Actualités",
        linkProps: routes.news().link,
    },
    {
        text: "A propos",
        linkProps: routes.about().link,
    },
    {
        menuLinks: [
            {
                linkProps: routes.faq().link,
                text: "Questions fréquentes",
            },
            {
                linkProps: routes.contact().link,
                text: "Nous écrire",
            },
        ],
        text: "Aide",
    },
];

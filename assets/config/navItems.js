import { routes } from "../router/router";

export const defaultNavItems = [
    {
        text: "Comment ça marche ?",
        linkProps: routes.docs().link,
    },
    {
        text: "Qu'est-ce qu'un flux de tuiles vectorielles ?",
        linkProps: routes.docs().link,
    },
    {
        text: "Plugin Géotuileur",
        linkProps: {
            href: "/plugin-qgis",
        },
    },
    {
        text: "À propos",
        linkProps: {
            href: "https://www.ign.fr/geoplateforme/la-geoplateforme-en-bref",
            target: "_blank",
            rel: "noopener",
        },
    },
];

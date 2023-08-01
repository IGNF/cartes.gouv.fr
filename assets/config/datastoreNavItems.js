import { routes } from "../router/router";

export const datastoreNavItems = (datastoreId) => {
    return [
        {
            text: "Tableau de bord",
            linkProps: {
                href: "#",
            },
        },
        {
            text: "Données",
            linkProps: routes.datastore_datasheet_list({ datastoreId }).link,
        },
        {
            text: "Membres",
            linkProps: {
                href: "#",
            },
        },
    ];
};

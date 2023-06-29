import { routes } from "../router/router";

export const datastoreNavItems = (datastoreId) => {
    return [
        {
            text: "Tableau de bord",
            linkProps: routes.datastore_dashboard({ datastoreId }).link,
        },
        {
            text: "Données",
            linkProps: routes.datastore_data_list({ datastoreId }).link,
        },
        {
            text: "Membres",
            linkProps: {
                href: "#",
            },
        },
    ];
};

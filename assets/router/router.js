import { createRouter, defineRoute, param } from "type-route";

const routeDefs = {
    // routes non protégées
    home: defineRoute("/"),
    docs: defineRoute("/docs"),

    // routes protégées
    // utilisateur
    my_account: defineRoute("/mon-compte"),

    // espaces de travail
    datastore_list: defineRoute("/datastores"),
    datastore_dashboard: defineRoute(
        {
            datastoreId: param.path.string,
        },
        (p) => `/datastores/${p.datastoreId}`
    ),
    datastore_data_new: defineRoute(
        {
            datastoreId: param.path.string,
        },
        (p) => `/datastores/${p.datastoreId}/data/new`
    ),
};

export const { RouteProvider, useRoute, routes } = createRouter(routeDefs);

export const protectedRoutes = ["my_account", "datastore_list", "datastore_dashboard", "datastore_add_data"];

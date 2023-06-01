import { createRouter, defineRoute, param } from "type-route";

const app_root = document.getElementById("root").dataset?.appRoot ?? "/";

const routeDefs = {
    // routes non protégées
    home: defineRoute(`${app_root}`),
    docs: defineRoute(`${app_root}/docs`),

    // routes protégées
    // utilisateur
    my_account: defineRoute(`${app_root}/mon-compte`),

    // espaces de travail
    datastore_list: defineRoute(`${app_root}/datastores`),
    datastore_dashboard: defineRoute(
        {
            datastoreId: param.path.string,
        },
        (p) => `${app_root}/datastores/${p.datastoreId}`
    ),
    datastore_data_new: defineRoute(
        {
            datastoreId: param.path.string,
        },
        (p) => `${app_root}/datastores/${p.datastoreId}/data/new`
    ),
};

export const { RouteProvider, useRoute, routes } = createRouter(routeDefs);

export const protectedRoutes = ["my_account", "datastore_list", "datastore_dashboard", "datastore_add_data"];

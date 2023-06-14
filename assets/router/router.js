import { createRouter, defineRoute, param } from "type-route";

const app_root = document.getElementById("root").dataset?.appRoot;

const routeDefs = {
    // routes non protégées
    home: defineRoute(app_root === "" ? "/" : app_root),
    docs: defineRoute(`${app_root}/documentation`),
    contact: defineRoute(`${app_root}/nous-ecrire`),
    news: defineRoute(`${app_root}/actualites`),
    sitemap: defineRoute(`${app_root}/plan-du-site`),
    accessibility: defineRoute(`${app_root}/accessibilite`),
    legal_notice: defineRoute(`${app_root}/mentions-legales`),
    cgu: defineRoute(`${app_root}/conditions-generales-d-utilisation`),
    personal_data: defineRoute(`${app_root}/donnees-personnelles`),
    cookies: defineRoute(`${app_root}/gestion-des-cookies`),

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

export const protectedRoutes = ["my_account", "datastore_list", "datastore_dashboard", "datastore_data_new"];

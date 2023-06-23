import { createRouter, defineRoute, param } from "type-route";

export const appRoot = document.getElementById("root").dataset?.appRoot;

const routeDefs = {
    // routes non protégées
    home: defineRoute(appRoot === "" ? "/" : appRoot),
    docs: defineRoute(`${appRoot}/documentation`),
    contact: defineRoute(`${appRoot}/nous-ecrire`),
    news: defineRoute(`${appRoot}/actualites`),
    sitemap: defineRoute(`${appRoot}/plan-du-site`),
    accessibility: defineRoute(`${appRoot}/accessibilite`),
    legal_notice: defineRoute(`${appRoot}/mentions-legales`),
    cgu: defineRoute(`${appRoot}/conditions-generales-d-utilisation`),
    personal_data: defineRoute(`${appRoot}/donnees-personnelles`),
    cookies: defineRoute(`${appRoot}/gestion-des-cookies`),

    // routes protégées
    // utilisateur
    my_account: defineRoute(`${appRoot}/mon-compte`),

    // espaces de travail
    datastore_list: defineRoute(`${appRoot}/datastores`),
    datastore_dashboard: defineRoute(
        {
            datastoreId: param.path.string,
        },
        (p) => `${appRoot}/datastores/${p.datastoreId}`
    ),
    datastore_data_list: defineRoute(
        {
            datastoreId: param.path.string,
        },
        (p) => `${appRoot}/datastores/${p.datastoreId}/data`
    ),
    datastore_data_new: defineRoute(
        {
            datastoreId: param.path.string,
        },
        (p) => `${appRoot}/datastores/${p.datastoreId}/data/new`
    ),

    // Creer et publier un service WFS
    datastore_wfs_service_new: defineRoute(
        {
            datastoreId: param.path.string,
            storedDataId: param.path.string,
        },
        (p) => `${appRoot}/datastores/${p.datastoreId}/data/${p.storedDataId}/service/wfs/new`
    ),
};

export const { RouteProvider, useRoute, routes } = createRouter(routeDefs);

export const publicRoutes = [
    "home",
    "docs",
    "contact",
    "news",
    "sitemap",
    "accessibility",
    "legal_notice",
    "cgu",
    "personal_data",
    "cookies",
];

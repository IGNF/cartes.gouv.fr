import { createRouter, defineRoute, param } from "type-route";

export const appRoot = (document.getElementById("root") as HTMLDivElement).dataset?.appRoot ?? "";

const routeDefs = {
    // routes non protégées
    home: defineRoute(appRoot === "" ? "/" : appRoot),
    about: defineRoute(`${appRoot}/a-propos`),
    docs: defineRoute(`${appRoot}/documentation`),
    contact: defineRoute(`${appRoot}/nous-ecrire`),
    contact_thanks: defineRoute(`${appRoot}/merci`),
    news_list: defineRoute(`${appRoot}/actualites`),
    news_article: defineRoute(
        {
            slug: param.path.string,
        },
        (p) => `${appRoot}/actualites/${p.slug}`
    ),
    faq: defineRoute(`${appRoot}/faq`),
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
        (p) => `${appRoot}/datastores/${p.datastoreId}/datasheet`
    ),
    datastore_data_new: defineRoute(
        {
            datastoreId: param.path.string,
        },
        (p) => `${appRoot}/datastores/${p.datastoreId}/datasheet/new`
    ),
    datastore_data_new_integration: defineRoute(
        {
            datastoreId: param.path.string,
            uploadId: param.query.string,
        },
        (p) => `${appRoot}/datastores/${p.datastoreId}/datasheet/new/integration`
    ),
    datastore_data_view: defineRoute(
        {
            datastoreId: param.path.string,
            datasheetName: param.path.string,
        },
        (p) => `${appRoot}/datastores/${p.datastoreId}/datasheet/${p.datasheetName}`
    ),

    // Creer et publier un service WFS
    datastore_wfs_service_new: defineRoute(
        {
            datastoreId: param.path.string,
            storedDataId: param.path.string,
        },
        (p) => `${appRoot}/datastores/${p.datastoreId}/datasheet/${p.storedDataId}/service/wfs/new`
    ),
};

export const { RouteProvider, useRoute, routes } = createRouter(routeDefs);

export const knownRoutes = Object.values(routes).map((r) => r.name);
export const publicRoutes = [
    "home",
    "about",
    "docs",
    "contact",
    "contact_thanks",
    "news_list",
    "news_article",
    "faq",
    "sitemap",
    "accessibility",
    "legal_notice",
    "cgu",
    "personal_data",
    "cookies",
];

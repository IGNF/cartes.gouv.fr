import { createRouter, defineRoute, param } from "type-route";

import SymfonyRouting from "../modules/Routing";

export const appRoot = SymfonyRouting.getBaseUrl(); // (document.getElementById("root") as HTMLDivElement).dataset?.appRoot ?? "";

const routeDefs = {
    // routes non protégées (doivent être listées plus bas dans publicRoutes)
    home: defineRoute(
        {
            authentication_failed: param.query.optional.number,
        },
        () => (appRoot === "" ? "/" : appRoot)
    ),
    about: defineRoute(`${appRoot}/a-propos`),
    documentation: defineRoute(`${appRoot}/documentation`),
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
    personal_data: defineRoute(`${appRoot}/donnees-personnelles`),

    // TODO PROVISOIRE : A SUPPRIMER PAR LA SUITE (Utilisee pour faire des tests perso)
    my_tries: defineRoute(`${appRoot}/mes-essais`),

    // routes protégées
    // utilisateur
    my_account: defineRoute(`${appRoot}/mon-compte`),

    dashboard_pro: defineRoute(`${appRoot}/dashboard`),

    // Demande de creation d'un datastore
    datastore_create_request: defineRoute(`${appRoot}/datastores/create_request`),

    // Demande pour rejoindre une communaute
    join_community: defineRoute(`${appRoot}/join_community`),

    datastore_create_request_confirm: defineRoute(`${appRoot}/confirmation`),

    // fiche de données
    datasheet_list: defineRoute(
        {
            datastoreId: param.path.string,
        },
        (p) => `${appRoot}/datastores/${p.datastoreId}/datasheet`
    ),
    datastore_datasheet_new: defineRoute(
        {
            datastoreId: param.path.string,
        },
        (p) => `${appRoot}/datastores/${p.datastoreId}/datasheet/new`
    ),
    datastore_datasheet_new_integration: defineRoute(
        {
            datastoreId: param.path.string,
            uploadId: param.query.string,
        },
        (p) => `${appRoot}/datastores/${p.datastoreId}/datasheet/new/integration`
    ),
    datastore_datasheet_view: defineRoute(
        {
            datastoreId: param.path.string,
            datasheetName: param.path.string,
            activeTab: param.query.optional.string.default("dataset"),
        },
        (p) => `${appRoot}/datastores/${p.datastoreId}/datasheet/${p.datasheetName}`
    ),
    datastore_stored_data_report: defineRoute(
        {
            datastoreId: param.path.string,
            storedDataId: param.path.string,
        },
        (p) => `${appRoot}/datastores/${p.datastoreId}/stored_data/${p.storedDataId}`
    ),

    // Creer et publier un service WFS
    datastore_wfs_service_new: defineRoute(
        {
            datastoreId: param.path.string,
            vectorDbId: param.query.string,
        },
        (p) => `${appRoot}/datastores/${p.datastoreId}/service/wfs/new`
    ),

    // Creer et publier un service WMS-VECTEUR
    datastore_wms_vector_service_new: defineRoute(
        {
            datastoreId: param.path.string,
            vectorDbId: param.query.string,
        },
        (p) => `${appRoot}/datastores/${p.datastoreId}/service/wms-vector/new`
    ),

    // Creation d'une pyramide vecteur
    datastore_pyramid_vector_new: defineRoute(
        {
            datastoreId: param.path.string,
            vectorDbId: param.query.string,
            technicalName: param.query.string,
        },
        (p) => `${appRoot}/datastores/${p.datastoreId}/pyramid-vector/new`
    ),

    // Publier un service TMS
    datastore_tms_vector_service_new: defineRoute(
        {
            datastoreId: param.path.string,
            pyramidId: param.query.string,
        },
        (p) => `${appRoot}/datastores/${p.datastoreId}/service/tms/new`
    ),

    datastore_service_view: defineRoute(
        {
            datastoreId: param.path.string,
            offeringId: param.path.string,
            datasheetName: param.query.optional.string,
        },
        (p) => `${appRoot}/datastores/${p.datastoreId}/service/${p.offeringId}`
    ),
};

export const { RouteProvider, useRoute, routes } = createRouter(routeDefs);

export const knownRoutes = Object.values(routes).map((r) => r.name);
export const publicRoutes = [
    "home",
    "about",
    "documentation",
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
    "my_tries", // TODO PROVISOIRE
];

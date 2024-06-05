import { createRouter, defineRoute, param } from "type-route";

import SymfonyRouting from "../modules/Routing";

export const appRoot = SymfonyRouting.getBaseUrl(); // (document.getElementById("root") as HTMLDivElement).dataset?.appRoot ?? "";
export const catalogueUrl = (document.getElementById("app_env") as HTMLDivElement)?.dataset?.["catalogueUrl"] ?? "/catalogue";

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

    // routes protégées
    // utilisateur
    my_account: defineRoute(`${appRoot}/mon-compte`),
    my_access_keys: defineRoute(`${appRoot}/mes-cles-acces`),
    user_key_add: defineRoute(`${appRoot}/add-key`),
    user_key_edit: defineRoute(
        {
            keyId: param.path.string,
        },
        (p) => `${appRoot}/edit_key/${p.keyId}`
    ),

    dashboard_pro: defineRoute(`${appRoot}/dashboard`),

    // Demande de creation d'un datastore
    datastore_create_request: defineRoute(`${appRoot}/datastores/create-request`),

    // Demande pour rejoindre une communaute
    join_community: defineRoute(`${appRoot}/join-community`),

    // Liste des membres d'une communaute
    members_list: defineRoute(
        {
            datastoreId: param.path.string,
            userId: param.query.optional.string,
        },
        (p) => `${appRoot}/datastore/${p.datastoreId}/members`
    ),

    accesses_request: defineRoute(
        {
            fileIdentifier: param.path.string,
        },
        (p) => `${appRoot}/accesses-request/${p.fileIdentifier}`
    ),

    datastore_create_request_confirm: defineRoute(`${appRoot}/confirmation`),

    datastore_manage_storage: defineRoute(
        {
            datastoreId: param.path.string,
        },
        (p) => `${appRoot}/datastores/${p.datastoreId}/manage-storage`
    ),

    datastore_manage_permissions: defineRoute(
        {
            datastoreId: param.path.string,
        },
        (p) => `${appRoot}/datastores/${p.datastoreId}/manage-permissions`
    ),

    datastore_add_permission: defineRoute(
        {
            datastoreId: param.path.string,
        },
        (p) => `${appRoot}/datastores/${p.datastoreId}/add-permission`
    ),

    datastore_edit_permission: defineRoute(
        {
            datastoreId: param.path.string,
            permissionId: param.path.string,
        },
        (p) => `${appRoot}/datastores/${p.datastoreId}/edit-permission/${p.permissionId}`
    ),

    // fiche de données
    datasheet_list: defineRoute(
        {
            datastoreId: param.path.string,
        },
        (p) => `${appRoot}/datastores/${p.datastoreId}/datasheet`
    ),
    datastore_datasheet_upload: defineRoute(
        {
            datastoreId: param.path.string,
            datasheetName: param.query.optional.string,
        },
        (p) => `${appRoot}/datastores/${p.datastoreId}/datasheet/upload`
    ),
    datastore_datasheet_upload_integration: defineRoute(
        {
            datastoreId: param.path.string,
            uploadId: param.query.string,
        },
        (p) => `${appRoot}/datastores/${p.datastoreId}/datasheet/upload/integration`
    ),
    datastore_datasheet_view: defineRoute(
        {
            datastoreId: param.path.string,
            datasheetName: param.path.string,
            activeTab: param.query.optional.string.default("metadata"),
        },
        (p) => `${appRoot}/datastores/${p.datastoreId}/datasheet/${p.datasheetName}`
    ),
    datastore_stored_data_details: defineRoute(
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
    // Modifier les infos d'un service WFS
    datastore_wfs_service_edit: defineRoute(
        {
            datastoreId: param.path.string,
            vectorDbId: param.query.string,
            offeringId: param.path.string,
        },
        (p) => `${appRoot}/datastores/${p.datastoreId}/service/wfs/${p.offeringId}/edit`
    ),

    // Creer et publier un service WMS-VECTEUR
    datastore_wms_vector_service_new: defineRoute(
        {
            datastoreId: param.path.string,
            vectorDbId: param.query.string,
        },
        (p) => `${appRoot}/datastores/${p.datastoreId}/service/wms-vector/new`
    ),
    // Modifier les infos d'un service WMS-VECTEUR
    datastore_wms_vector_service_edit: defineRoute(
        {
            datastoreId: param.path.string,
            vectorDbId: param.query.string,
            offeringId: param.path.string,
        },
        (p) => `${appRoot}/datastores/${p.datastoreId}/service/wms-vector/${p.offeringId}/edit`
    ),

    // Création/génération d'une pyramide vecteur
    datastore_pyramid_vector_generate: defineRoute(
        {
            datastoreId: param.path.string,
            vectorDbId: param.query.string,
            technicalName: param.query.string,
        },
        (p) => `${appRoot}/datastores/${p.datastoreId}/pyramid-vector/new`
    ),

    // Publier une pyramide vecteur en tant que service TMS
    datastore_pyramid_vector_tms_service_new: defineRoute(
        {
            datastoreId: param.path.string,
            pyramidId: param.query.string,
        },
        (p) => `${appRoot}/datastores/${p.datastoreId}/service/tms/new`
    ),
    // Modifier les infos d'un service WMS-VECTEUR
    datastore_pyramid_vector_tms_service_edit: defineRoute(
        {
            datastoreId: param.path.string,
            pyramidId: param.query.string,
            offeringId: param.path.string,
        },
        (p) => `${appRoot}/datastores/${p.datastoreId}/service/tms/${p.offeringId}/edit`
    ),

    datastore_service_view: defineRoute(
        {
            datastoreId: param.path.string,
            offeringId: param.path.string,
            datasheetName: param.query.string,
            activeTab: param.query.optional.string.default("diffuse"),
        },
        (p) => `${appRoot}/datastores/${p.datastoreId}/service/${p.offeringId}`
    ),

    espaceco_community_list: defineRoute(
        {
            page: param.query.optional.number.default(1),
            filter: param.query.optional.string.default("public"),
        },
        () => `${appRoot}/espaceco/community`
    ),
};

export const { RouteProvider, useRoute, routes, session } = createRouter(routeDefs);

export const knownRoutes = Object.values(routes).map((r) => r.name);
export const publicRoutes: typeof knownRoutes = [
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
    "personal_data",
];

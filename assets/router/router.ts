import { createRouter, defineRoute, param } from "type-route";

import SymfonyRouting from "../modules/Routing";

export const appRoot = SymfonyRouting.getBaseUrl(); // (document.getElementById("root") as HTMLDivElement).dataset?.appRoot ?? "";
export const catalogueUrl = (document.getElementById("app_env") as HTMLDivElement)?.dataset?.["catalogueUrl"] ?? "/catalogue";

const routeDefs = {
    // NOTE : routes non protégées (doivent être listées plus bas dans publicRoutes)
    home: defineRoute(
        {
            authentication_failed: param.query.optional.number,
            session_expired_login_success: param.query.optional.number,
        },
        () => (appRoot === "" ? "/" : appRoot)
    ),
    page_not_found: defineRoute(`${appRoot}/404`),
    about: defineRoute(`${appRoot}/a-propos`),
    documentation: defineRoute(`${appRoot}/documentation`),
    contact: defineRoute(`${appRoot}/nous-ecrire`),
    contact_thanks: defineRoute(`${appRoot}/nous-ecrire/demande-envoyee`),
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
    offer: defineRoute(`${appRoot}/offre`),
    join: defineRoute(`${appRoot}/nous-rejoindre`),
    terms_of_service: defineRoute(`${appRoot}/cgu`),
    service_status: defineRoute(`${appRoot}/niveau-de-service`),
    login_disabled: defineRoute(`${appRoot}/connexion-desactivee`),

    // NOTE : routes protégées
    // utilisateur
    my_account: defineRoute(`${appRoot}/mon-compte`),
    my_access_keys: defineRoute(`${appRoot}/mes-cles`),
    user_key_add: defineRoute(`${appRoot}/mes-cles/ajout`),
    user_key_edit: defineRoute(
        {
            keyId: param.path.string,
        },
        (p) => `${appRoot}/mes-cles/${p.keyId}/modification`
    ),

    dashboard_pro: defineRoute(`${appRoot}/tableau-de-bord`),

    // Demande de creation d'un datastore
    datastore_create_request: defineRoute(`${appRoot}/entrepot/demande-de-creation`),

    // Demande pour rejoindre une communaute
    join_community: defineRoute(`${appRoot}/rejoindre-des-communautes`),

    // Liste des membres d'une communaute
    members_list: defineRoute(
        {
            communityId: param.path.string,
            userId: param.query.optional.string,
        },
        (p) => `${appRoot}/communaute/${p.communityId}/membres`
    ),

    // NOTE : désactivé car la variable d'environnement `geonetwork_url` a été supprimée, parce qu'en production la route `geonetwork/srv/api/records/$fileIdentifier/formatters/xml` n'est pas disponible
    // accesses_request: defineRoute(
    //     {
    //         fileIdentifier: param.path.string,
    //     },
    //     (p) => `${appRoot}/demande-acces/${p.fileIdentifier}`
    // ),

    datastore_create_request_confirm: defineRoute(`${appRoot}/demande-acces/demande-envoyee`),

    datastore_manage_storage: defineRoute(
        {
            datastoreId: param.path.string,
        },
        (p) => `${appRoot}/entrepot/${p.datastoreId}/consommation`
    ),

    datastore_manage_permissions: defineRoute(
        {
            datastoreId: param.path.string,
        },
        (p) => `${appRoot}/entrepot/${p.datastoreId}/permissions`
    ),

    datastore_add_permission: defineRoute(
        {
            datastoreId: param.path.string,
        },
        (p) => `${appRoot}/entrepot/${p.datastoreId}/permissions/ajout`
    ),

    datastore_edit_permission: defineRoute(
        {
            datastoreId: param.path.string,
            permissionId: param.path.string,
        },
        (p) => `${appRoot}/entrepot/${p.datastoreId}/permissions/${p.permissionId}/modification`
    ),

    // fiche de données
    datasheet_list: defineRoute(
        {
            datastoreId: param.path.string,
        },
        (p) => `${appRoot}/entrepot/${p.datastoreId}/donnees`
    ),
    datastore_datasheet_upload: defineRoute(
        {
            datastoreId: param.path.string,
            datasheetName: param.query.optional.string,
        },
        (p) => `${appRoot}/entrepot/${p.datastoreId}/donnees/televersement`
    ),
    datastore_datasheet_upload_integration: defineRoute(
        {
            datastoreId: param.path.string,
            uploadId: param.query.string,
            datasheetName: param.query.optional.string,
        },
        (p) => `${appRoot}/entrepot/${p.datastoreId}/donnees/integration`
    ),
    datastore_datasheet_view: defineRoute(
        {
            datastoreId: param.path.string,
            datasheetName: param.path.string,
            activeTab: param.query.optional.string.default("metadata"),
        },
        (p) => `${appRoot}/entrepot/${p.datastoreId}/donnees/${p.datasheetName}`
    ),
    datastore_stored_data_details: defineRoute(
        {
            datastoreId: param.path.string,
            storedDataId: param.path.string,
            datasheetName: param.query.optional.string,
        },
        (p) => `${appRoot}/entrepot/${p.datastoreId}/donnees/${p.storedDataId}/details`
    ),

    // Creer et publier un service WFS
    datastore_wfs_service_new: defineRoute(
        {
            datastoreId: param.path.string,
            vectorDbId: param.query.string,
            datasheetName: param.query.string,
        },
        (p) => `${appRoot}/entrepot/${p.datastoreId}/service/wfs/ajout`
    ),
    // Modifier les infos d'un service WFS
    datastore_wfs_service_edit: defineRoute(
        {
            datastoreId: param.path.string,
            vectorDbId: param.query.string,
            offeringId: param.path.string,
            datasheetName: param.query.string,
        },
        (p) => `${appRoot}/entrepot/${p.datastoreId}/service/wfs/${p.offeringId}/modification`
    ),

    // Creer et publier un service WMS-VECTEUR
    datastore_wms_vector_service_new: defineRoute(
        {
            datastoreId: param.path.string,
            vectorDbId: param.query.string,
            datasheetName: param.query.string,
        },
        (p) => `${appRoot}/entrepot/${p.datastoreId}/service/wms-vecteur/ajout`
    ),
    // Modifier les infos d'un service WMS-VECTEUR
    datastore_wms_vector_service_edit: defineRoute(
        {
            datastoreId: param.path.string,
            vectorDbId: param.query.string,
            offeringId: param.path.string,
            datasheetName: param.query.string,
        },
        (p) => `${appRoot}/entrepot/${p.datastoreId}/service/wms-vecteur/${p.offeringId}/modification`
    ),

    // Création/génération d'une pyramide vecteur
    datastore_pyramid_vector_generate: defineRoute(
        {
            datastoreId: param.path.string,
            vectorDbId: param.query.string,
            technicalName: param.query.string,
            datasheetName: param.query.string,
        },
        (p) => `${appRoot}/entrepot/${p.datastoreId}/pyramide-vecteur/ajout`
    ),

    // Publier une pyramide vecteur en tant que service TMS
    datastore_pyramid_vector_tms_service_new: defineRoute(
        {
            datastoreId: param.path.string,
            pyramidId: param.query.string,
            datasheetName: param.query.string,
        },
        (p) => `${appRoot}/entrepot/${p.datastoreId}/service/tms/ajout`
    ),
    // Modifier les infos d'un service WMS-VECTEUR
    datastore_pyramid_vector_tms_service_edit: defineRoute(
        {
            datastoreId: param.path.string,
            pyramidId: param.query.string,
            offeringId: param.path.string,
            datasheetName: param.query.string,
        },
        (p) => `${appRoot}/entrepot/${p.datastoreId}/service/tms/${p.offeringId}/modification`
    ),

    // Création/génération d'une pyramide raster
    datastore_pyramid_raster_generate: defineRoute(
        {
            datastoreId: param.path.string,
            offeringId: param.query.string,
            datasheetName: param.query.string,
        },
        (p) => `${appRoot}/entrepot/${p.datastoreId}/pyramide-raster/ajout`
    ),
    datastore_pyramid_raster_wms_raster_service_new: defineRoute(
        {
            datastoreId: param.path.string,
            pyramidId: param.query.string,
            datasheetName: param.query.string,
        },
        (p) => `${appRoot}/entrepot/${p.datastoreId}/service/wms-raster/ajout`
    ),
    datastore_pyramid_raster_wms_raster_service_edit: defineRoute(
        {
            datastoreId: param.path.string,
            pyramidId: param.query.string,
            offeringId: param.path.string,
            datasheetName: param.query.string,
        },
        (p) => `${appRoot}/entrepot/${p.datastoreId}/service/wms-raster/${p.offeringId}/modification`
    ),
    datastore_pyramid_raster_wmts_service_new: defineRoute(
        {
            datastoreId: param.path.string,
            pyramidId: param.query.string,
            datasheetName: param.query.string,
        },
        (p) => `${appRoot}/entrepot/${p.datastoreId}/service/wmts/ajout`
    ),
    datastore_pyramid_raster_wmts_service_edit: defineRoute(
        {
            datastoreId: param.path.string,
            pyramidId: param.query.string,
            offeringId: param.path.string,
            datasheetName: param.query.string,
        },
        (p) => `${appRoot}/entrepot/${p.datastoreId}/service/wmts/${p.offeringId}/modification`
    ),

    datastore_service_view: defineRoute(
        {
            datastoreId: param.path.string,
            offeringId: param.path.string,
            datasheetName: param.query.string,
            activeTab: param.query.optional.string.default("diffuse"),
        },
        (p) => `${appRoot}/entrepot/${p.datastoreId}/service/${p.offeringId}/visualisation`
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
    "offer",
    "join",
    "terms_of_service",
    "service_status",
    "login_disabled",
];

import { createGroup, createRouter, defineRoute, param } from "type-route";

import SymfonyRouting from "../modules/Routing";

export const appRoot = SymfonyRouting.getBaseUrl(); // (document.getElementById("root") as HTMLDivElement).dataset?.appRoot ?? "";
export const catalogueUrl = (document.getElementById("app_env") as HTMLDivElement)?.dataset?.["catalogueUrl"] ?? "/catalogue";

// Routes non protégées
const publicRoutes = {
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
    contact_confirmation: defineRoute(`${appRoot}/nous-ecrire/demande-envoyee`),
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
};

// Routes protégées qui ne sont pas dans des groupes spécifiques plus bas (community, datastore...etc.)
const privateRoutes = {
    // utilisateur
    my_account: defineRoute(`${appRoot}/mon-compte`),
    my_access_keys: defineRoute(`${appRoot}/mes-cles`),
    my_permissions: defineRoute(`${appRoot}/mes-permissions`),
    user_key_add: defineRoute(`${appRoot}/mes-cles/ajout`),
    user_key_edit: defineRoute(
        {
            keyId: param.path.string,
        },
        (p) => `${appRoot}/mes-cles/${p.keyId}/modification`
    ),
    my_documents: defineRoute(`${appRoot}/mes-documents`),

    dashboard_pro: defineRoute(`${appRoot}/tableau-de-bord`),

    // Demande de creation d'un datastore
    datastore_create_request: defineRoute(`${appRoot}/entrepot/demande-de-creation`),
    datastore_create_request_confirm: defineRoute(`${appRoot}/entrepot/demande-de-creation/demande-envoyee`),

    // Demande pour rejoindre une communaute
    join_community: defineRoute(`${appRoot}/rejoindre-des-communautes`),

    accesses_request: defineRoute(
        {
            fileIdentifier: param.path.string,
        },
        (p) => `${appRoot}/demande-acces/${p.fileIdentifier}`
    ),
};

const communityRoute = defineRoute(
    {
        communityId: param.path.string,
    },
    (p) => `${appRoot}/communaute/${p.communityId}`
);
const communityRoutes = {
    // Liste des membres d'une communaute
    members_list: communityRoute.extend(
        {
            userId: param.query.optional.string,
        },
        () => "/membres"
    ),
};

const datastoreRoute = defineRoute(
    {
        datastoreId: param.path.string,
    },
    (p) => `${appRoot}/entrepot/${p.datastoreId}`
);
const datastoreRoutes = {
    datastore_manage_storage: datastoreRoute.extend("/consommation"),

    // permissions
    datastore_manage_permissions: datastoreRoute.extend("/permissions"),
    datastore_add_permission: datastoreRoute.extend("/permissions/ajout"),
    datastore_edit_permission: datastoreRoute.extend(
        {
            permissionId: param.path.string,
        },
        (p) => `/permissions/${p.permissionId}/modification`
    ),

    // fiche de données
    datasheet_list: datastoreRoute.extend("/permissions/donnees"),
    datastore_datasheet_upload: datastoreRoute.extend(
        {
            datasheetName: param.query.optional.string,
        },
        () => "/donnees/televersement"
    ),
    datastore_datasheet_upload_integration: datastoreRoute.extend(
        {
            uploadId: param.query.string,
            datasheetName: param.query.optional.string,
        },
        () => "/donnees/integration"
    ),
    datastore_datasheet_view: datastoreRoute.extend(
        {
            datasheetName: param.path.string,
            activeTab: param.query.optional.string.default("metadata"),
        },
        (p) => `/donnees/${p.datasheetName}`
    ),
    datastore_stored_data_details: datastoreRoute.extend(
        {
            storedDataId: param.path.string,
            datasheetName: param.query.optional.string,
        },
        (p) => `/donnees/${p.storedDataId}/details`
    ),
    datastore_upload_details: datastoreRoute.extend(
        {
            uploadId: param.path.string,
            datasheetName: param.query.optional.string,
        },
        (p) => `/livraisons/${p.uploadId}/rapport`
    ),

    // Creer et publier un service WFS
    datastore_wfs_service_new: datastoreRoute.extend(
        {
            vectorDbId: param.query.string,
            datasheetName: param.query.string,
        },
        () => "/service/wfs/ajout"
    ),
    // Modifier les infos d'un service WFS
    datastore_wfs_service_edit: datastoreRoute.extend(
        {
            vectorDbId: param.query.string,
            offeringId: param.path.string,
            datasheetName: param.query.string,
        },
        (p) => `/service/wfs/${p.offeringId}/modification`
    ),

    // Creer et publier un service WMS-VECTEUR
    datastore_wms_vector_service_new: datastoreRoute.extend(
        {
            vectorDbId: param.query.string,
            datasheetName: param.query.string,
        },
        () => "/service/wms-vecteur/ajout"
    ),
    // Modifier les infos d'un service WMS-VECTEUR
    datastore_wms_vector_service_edit: datastoreRoute.extend(
        {
            vectorDbId: param.query.string,
            offeringId: param.path.string,
            datasheetName: param.query.string,
        },
        (p) => `/service/wms-vecteur/${p.offeringId}/modification`
    ),

    // Création/génération d'une pyramide vecteur
    datastore_pyramid_vector_generate: datastoreRoute.extend(
        {
            vectorDbId: param.query.string,
            technicalName: param.query.string,
            datasheetName: param.query.string,
        },
        () => "/pyramide-vecteur/ajout"
    ),

    // Publier une pyramide vecteur en tant que service TMS
    datastore_pyramid_vector_tms_service_new: datastoreRoute.extend(
        {
            pyramidId: param.query.string,
            datasheetName: param.query.string,
        },
        () => "/service/tms/ajout"
    ),
    // Modifier les infos d'un service WMS-VECTEUR
    datastore_pyramid_vector_tms_service_edit: datastoreRoute.extend(
        {
            pyramidId: param.query.string,
            offeringId: param.path.string,
            datasheetName: param.query.string,
        },
        (p) => `/service/tms/${p.offeringId}/modification`
    ),

    // Création/génération d'une pyramide raster
    datastore_pyramid_raster_generate: datastoreRoute.extend(
        {
            offeringId: param.query.string,
            datasheetName: param.query.string,
        },
        () => "/pyramide-raster/ajout"
    ),
    datastore_pyramid_raster_wms_raster_service_new: datastoreRoute.extend(
        {
            pyramidId: param.query.string,
            datasheetName: param.query.string,
        },
        () => "/service/wms-raster/ajout"
    ),
    datastore_pyramid_raster_wms_raster_service_edit: datastoreRoute.extend(
        {
            pyramidId: param.query.string,
            offeringId: param.path.string,
            datasheetName: param.query.string,
        },
        () => "/service/wms-raster/${p.offeringId}/modification"
    ),
    datastore_pyramid_raster_wmts_service_new: datastoreRoute.extend(
        {
            pyramidId: param.query.string,
            datasheetName: param.query.string,
        },
        () => "/service/wmts/ajout"
    ),
    datastore_pyramid_raster_wmts_service_edit: datastoreRoute.extend(
        {
            pyramidId: param.query.string,
            offeringId: param.path.string,
            datasheetName: param.query.string,
        },
        (p) => `/service/wmts/${p.offeringId}/modification`
    ),

    datastore_service_view: datastoreRoute.extend(
        {
            offeringId: param.path.string,
            datasheetName: param.query.string,
            activeTab: param.query.optional.string.default("diffuse"),
        },
        (p) => `/service/${p.offeringId}/visualisation`
    ),
};

const espacecoRoutes = {
    espaceco_community_list: defineRoute(
        {
            page: param.query.optional.number.default(1),
            filter: param.query.optional.string.default("public"),
        },
        () => `${appRoot}/espaceco/community`
    ),
};

const routeDefs = {
    ...publicRoutes,
    ...privateRoutes,
    ...communityRoutes,
    ...datastoreRoutes,
    ...espacecoRoutes,
};
export const { RouteProvider, useRoute, routes, session } = createRouter(routeDefs);

export const knownRoutes = Object.values(routes).map((r) => r.name);
export const publicGroup = createGroup((Object.keys(publicRoutes) as (keyof typeof publicRoutes)[]).map((key) => routes[key]));
export const privateGroup = createGroup((Object.keys(privateRoutes) as (keyof typeof privateRoutes)[]).map((key) => routes[key]));
export const communityGroup = createGroup((Object.keys(communityRoutes) as (keyof typeof communityRoutes)[]).map((key) => routes[key]));
export const datastoreGroup = createGroup((Object.keys(datastoreRoutes) as (keyof typeof datastoreRoutes)[]).map((key) => routes[key]));
export const espacecoGroup = createGroup((Object.keys(espacecoRoutes) as (keyof typeof espacecoRoutes)[]).map((key) => routes[key]));

export const groups = {
    public: publicGroup,
    private: privateGroup,
    community: communityGroup,
    datastore: datastoreGroup,
    espaceco: espacecoGroup,
};

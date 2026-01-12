import { createGroup, createRouter, defineRoute, param } from "type-route";

import SymfonyRouting from "../modules/Routing";

export const appRoot = SymfonyRouting.getBaseUrl();

// Routes non protégées
const publicRoutes = {
    home: defineRoute(
        {
            authentication_failed: param.query.optional.number,
            session_expired_login_success: param.query.optional.number,
        },
        () => (appRoot === "" ? "/" : appRoot)
    ),
    discover: defineRoute(
        {
            authentication_failed: param.query.optional.number,
            session_expired_login_success: param.query.optional.number,
        },
        () => `${appRoot}/decouvrir`
    ),
    discover_publish: defineRoute(
        {
            authentication_failed: param.query.optional.number,
            session_expired_login_success: param.query.optional.number,
        },
        () => `${appRoot}/publier-une-donnee`
    ),
    present_service_maps: defineRoute(`${appRoot}/decouvrir/explorer-les-cartes`),
    present_service_catalogue: defineRoute(`${appRoot}/decouvrir/rechercher-une-donnee`),
    present_service_publish: defineRoute(`${appRoot}/decouvrir/publier-une-donnee`),
    page_not_found: defineRoute(`${appRoot}/404`),
    contact: defineRoute(`${appRoot}/nous-ecrire`),
    contact_confirmation: defineRoute(`${appRoot}/nous-ecrire/demande-envoyee`),
    news_list: defineRoute(
        {
            page: param.query.optional.number.default(0),
        },
        () => `${appRoot}/actualites`
    ),
    news_list_by_tag: defineRoute(
        {
            tag: param.path.optional.string,
            page: param.query.optional.number.default(0),
        },
        (p) => `${appRoot}/actualites/liste/${p.tag}`
    ),
    news_article: defineRoute(
        {
            slug: param.path.string,
        },
        (p) => `${appRoot}/actualites/${p.slug}`
    ),
    sitemap: defineRoute(`${appRoot}/plan-du-site`),
    accessibility: defineRoute(`${appRoot}/accessibilite`),
    legal_notice: defineRoute(`${appRoot}/mentions-legales`),
    personal_data: defineRoute(`${appRoot}/donnees-personnelles`),
    offers: defineRoute(`${appRoot}/offres`),
    join_cartesgouvfr_community: defineRoute(`${appRoot}/nous-rejoindre`),
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
    my_documents: defineRoute(`${appRoot}/mes-documents`), // TODO : page uniquement créée pour tester les routes /users/me/documents

    dashboard: defineRoute(`${appRoot}/tableau-de-bord`),
    datastore_selection: defineRoute(
        {
            page: param.query.optional.number.default(1),
            limit: param.query.optional.number.default(20),
            search: param.query.optional.string.default(""),
        },
        () => `${appRoot}/tableau-de-bord/entrepots`
    ),

    // Demande de creation d'un datastore
    datastore_create_request: defineRoute(`${appRoot}/tableau-de-bord/entrepots/demande-de-creation`),

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
    (p) => `${appRoot}/tableau-de-bord/communaute/${p.communityId}`
);
const communityRoutes = {
    community_info: communityRoute.extend(""),
    // Liste des membres d'une communaute
    members_list: communityRoute.extend(
        {
            userId: param.query.optional.string,
            page: param.query.optional.number.default(1),
            limit: param.query.optional.number.default(20),
            search: param.query.optional.string.default(""),
        },
        () => "/membres"
    ),
};

const datastoreRoute = defineRoute(
    {
        datastoreId: param.path.string,
    },
    (p) => `${appRoot}/tableau-de-bord/entrepots/${p.datastoreId}`
);
const datastoreRoutes = {
    datastore_manage_storage: datastoreRoute.extend("/consommation"),

    // permissions
    datastore_manage_permissions: datastoreRoute.extend(
        {
            page: param.query.optional.number.default(1),
            limit: param.query.optional.number.default(4),
        },
        () => "/permissions"
    ),
    datastore_add_permission: datastoreRoute.extend("/permissions/ajout"),
    datastore_edit_permission: datastoreRoute.extend(
        {
            permissionId: param.path.string,
        },
        (p) => `/permissions/${p.permissionId}/modification`
    ),

    // fiche de données
    datasheet_list: datastoreRoute.extend(
        {
            page: param.query.optional.number.default(1),
            limit: param.query.optional.number.default(10),
            search: param.query.optional.string,
            sortBy: param.query.optional.string,
            sortOrder: param.query.optional.number.default(1),
            published: param.query.optional.number.default(0),
        },
        () => "/donnees"
    ),
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
        },
        (p) => `/service/${p.offeringId}/visualisation`
    ),
    datastore_service_style_add: datastoreRoute.extend(
        {
            offeringId: param.path.string,
            datasheetName: param.query.string,
        },
        (p) => `/service/${p.offeringId}/style/ajout`
    ),
    datastore_service_style_edit: datastoreRoute.extend(
        {
            offeringId: param.path.string,
            styleTechnicalName: param.path.string,
            datasheetName: param.query.string,
        },
        (p) => `/service/${p.offeringId}/style/${p.styleTechnicalName}/modification`
    ),
};

const configRoutes = {
    config_alerts: defineRoute(`${appRoot}/configuration/alertes`),
};

const espacecoRoutes = {
    espaceco_community_list: defineRoute(
        {
            page: param.query.optional.number.default(1),
            filter: param.query.optional.string.default("listed"),
        },
        () => `${appRoot}/espace-collaboratif`
    ),

    espaceco_create_community: defineRoute(
        {
            communityId: param.path.number,
        },
        (p) => `${appRoot}/espace-collaboratif/${p.communityId}/creer-un-guichet`
    ),

    espaceco_manage_community: defineRoute(
        {
            communityId: param.path.number,
            activeTab: param.query.optional.string.default("description"),
        },
        (p) => `${appRoot}/espace-collaboratif/${p.communityId}/gerer-le-guichet`
    ),

    espaceco_member_invitation: defineRoute(
        {
            communityId: param.path.number,
        },
        (p) => `${appRoot}/espace-collaboratif/${p.communityId}/invitation`
    ),
};

const routeDefs = {
    ...publicRoutes,
    ...privateRoutes,
    ...communityRoutes,
    ...datastoreRoutes,
    ...configRoutes,
    ...espacecoRoutes,
};
export const { RouteProvider, useRoute, routes, session } = createRouter(routeDefs);

export const knownRoutes = Object.values(routes).map((r) => r.name);
export const publicGroup = createGroup((Object.keys(publicRoutes) as (keyof typeof publicRoutes)[]).map((key) => routes[key]));
export const privateGroup = createGroup((Object.keys(privateRoutes) as (keyof typeof privateRoutes)[]).map((key) => routes[key]));
export const communityGroup = createGroup((Object.keys(communityRoutes) as (keyof typeof communityRoutes)[]).map((key) => routes[key]));
export const datastoreGroup = createGroup((Object.keys(datastoreRoutes) as (keyof typeof datastoreRoutes)[]).map((key) => routes[key]));
export const configGroup = createGroup((Object.keys(configRoutes) as (keyof typeof configRoutes)[]).map((key) => routes[key]));
export const espacecoGroup = createGroup((Object.keys(espacecoRoutes) as (keyof typeof espacecoRoutes)[]).map((key) => routes[key]));

export const groups = {
    public: publicGroup,
    private: privateGroup,
    community: communityGroup,
    datastore: datastoreGroup,
    config: configGroup,
    espaceco: espacecoGroup,
};

import { startEulerianAnalytics } from "@codegouvfr/react-dsfr/eulerianAnalytics";
import { Route } from "type-route";

import { appEnv } from "@/env";
import { groups, routes } from "@/router/router";

declare global {
    interface Window {
        _paq?: unknown[][];
    }
}

// Clé écrite par l’ancienne bannière de consentement react-dsfr
const LEGACY_CONSENT_STORAGE_KEY = "@codegouvfr/react-dsfr finalityConsent eulerianAnalytics";
// Opt-out posés par la page /donnees-personnelles (même origine) : cookie Matomo, clé localStorage du module analytics du DSFR
const MATOMO_OPTOUT_COOKIE = "mtm_consent_removed";
const EULERIAN_OPTOUT_STORAGE_KEY = "_EA_";
const MATOMO_HOST = "https://matomo.ign.fr/";
const MATOMO_SITE_ID = "11";

export function isMatomoOptedOut(cookie = document.cookie): boolean {
    return cookie.split(";").some((item) => item.trim().split("=")[0] === MATOMO_OPTOUT_COOKIE);
}

export function isEulerianOptedOut(storage: Pick<Storage, "getItem"> = localStorage): boolean {
    return storage.getItem(EULERIAN_OPTOUT_STORAGE_KEY) !== null;
}

export async function analyticsInit() {
    localStorage.removeItem(LEGACY_CONSENT_STORAGE_KEY);

    if (!isMatomoOptedOut()) {
        matomoInit();
    }

    // le module DSFR refuse de démarrer si l’utilisateur a refusé ; on ne force jamais enable()
    if (!isEulerianOptedOut()) {
        try {
            await startEulerianAnalytics({
                domain: "acwg.cartes.gouv.fr",
                site: {
                    environment: appEnv === "prod" ? "production" : "development",
                    entity: "IGN",
                },
            });
        } catch (error) {
            console.error("Eulerian analytics initialization failed", error);
        }
    }
}

function matomoInit() {
    const _paq = (window._paq = window._paq ?? []);
    _paq.push(["setTrackerUrl", MATOMO_HOST + "matomo.php"]);
    _paq.push(["setSiteId", MATOMO_SITE_ID]);
    _paq.push(["setDoNotTrack", true]);
    _paq.push(["enableLinkTracking"]);
    const g = document.createElement("script");
    const s = document.getElementsByTagName("script")[0];
    g.async = true;
    g.src = MATOMO_HOST + "matomo.js";
    s.parentNode?.insertBefore(g, s);
}

const matomoPageLabels: Record<keyof typeof routes, string> = {
    discover_publish: "Publier une donnée",
    page_not_found: "Page introuvable",
    login_disabled: "Connexion momentanément désactivée",
    my_account: "Mon compte",
    my_access_keys: "Mes clés d’accès",
    my_permissions: "Mes permissions",
    user_key_add: "Ajout d’une clé",
    user_key_edit: "Modification de la clé",
    my_documents: "Mes documents",
    dashboard: "Tableau de bord",
    join_community: "Ajouter un entrepôt",
    accesses_request: "Demande d’accès",
    stats_scope_selection: "Statistiques de consommation",
    stats_by_scope: "Statistiques de consommation",
    community_info: "Fiche communauté",
    members_list: "Membres",
    datastore_selection: "Entrepôts",
    datastore_create_request: "Ajouter un entrepôt",
    datasheet_list: "Données entrepôt",
    datastore_datasheet_view: "Fiche de données",
    datastore_service_view: "Visualisation données",
    datastore_manage_storage: "Consommation entrepôt",
    datastore_manage_permissions: "Permissions entrepôt",
    datastore_add_permission: "Ajout d’une permission",
    datastore_edit_permission: "Mise à jour d’une permission",
    datastore_datasheet_upload: "Créer une fiche de données",
    datastore_datasheet_upload_integration: "Données intégration",
    datastore_stored_data_details: "Détails de donnée stockée",
    datastore_wfs_service_new: "Publier un service WFS",
    datastore_wfs_service_edit: "Modifier le service WFS",
    datastore_wms_vector_service_new: "Publier un service WMS-Vecteur",
    datastore_wms_vector_service_edit: "Modifier le service WMS-Vecteur",
    datastore_pyramid_vector_tms_service_new: "Publier un service TMS",
    datastore_pyramid_vector_tms_service_edit: "Modifier le service TMS",
    datastore_pyramid_raster_wms_raster_service_new: "Publier un service WMS-Raster",
    datastore_pyramid_raster_wms_raster_service_edit: "Modifier le service WMS-Raster",
    datastore_pyramid_raster_wmts_service_new: "Publier un service WMTS",
    datastore_pyramid_raster_wmts_service_edit: "Modifier le service WMTS",
    datastore_pyramid_raster_generate: "Générer une pyramide de tuiles raster",
    datastore_service_style_add: "Ajouter un style",
    datastore_service_style_edit: "Modifier le style",
    espaceco_community_list: "Liste des guichets",
    espaceco_create_community: "Création d’un guichet",
    espaceco_manage_community: "Gérer le guichet",
    espaceco_member_invitation: "Invitation",
    datastore_upload_details: "Détails de livraison",
    datastore_pyramid_vector_generate: "Générer une pyramide de tuiles vectorielles",
    config_alerts: "Configuration des alertes",
};

export function matomoPageTitle(route: Route<typeof routes>): string {
    const prefix: "[Publier]" | "[Contribuer]" = groups.espaceco.has(route) ? "[Contribuer]" : "[Publier]";
    const label = route.name === false ? matomoPageLabels.page_not_found : matomoPageLabels[route.name];

    return `${prefix} ${label}`;
}

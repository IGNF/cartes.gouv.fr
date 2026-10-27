import { Route } from "type-route";

import { routes } from "@/router/router";

declare global {
    interface Window {
        _paq?: unknown[][];
    }
}

export function matomoInit() {
    const _paq = (window._paq = window._paq ?? []);
    const u = "https://matomo.ign.fr/";
    _paq.push(["setTrackerUrl", u + "matomo.php"]);
    _paq.push(["setSiteId", "11"]);
    const g = document.createElement("script");
    const s = document.getElementsByTagName("script")[0];
    g.async = true;
    g.src = u + "matomo.js";
    s.parentNode?.insertBefore(g, s);
}

const matomoPageLabels: Partial<Record<keyof typeof routes, string>> = {
    discover_publish: "Publier une donnée",
    page_not_found: "Page introuvable",
    login_disabled: "Connexion momentanément désactivée",
    my_account: "Mon compte",
    my_access_keys: "Mes clés d’accès",
    my_permissions: "Mes permissions",
    user_key_add: "Ajout d’une clé",
    user_key_edit: "Modification de la clé",
    my_documents: "",
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
    datastore_edit_permission: "Mise à jour d'une permission",
    datastore_datasheet_upload: "Créer une fiche de données",
    datastore_datasheet_upload_integration: "Données integration",
    datastore_stored_data_details: "Détails de donnée stockée",
    datastore_wfs_service_new: "Publier un service TMS",
    datastore_wfs_service_edit: "Modifier le service WFS",
    datastore_wms_vector_service_new: "Publier un service WMS-Vecteur",
    datastore_wms_vector_service_edit: "Modifier le service WMS-Vecteur",
    datastore_pyramid_vector_tms_service_new: "Publier un service TMS",
    datastore_pyramid_vector_tms_service_edit: "Modifier le service TMS",
    datastore_pyramid_raster_wms_raster_service_new: "Publier un service WMS-Raster",
    datastore_pyramid_raster_wms_raster_service_edit: "Modifier le service WMS-Raster",
    datastore_pyramid_raster_wmts_service_edit: "Modifier le service WMTS",
    datastore_pyramid_raster_generate: "Générer une pyramide de tuiles raster",
    datastore_service_style_add: "Ajouter un style",
    datastore_service_style_edit: "Modifier le style",
    espaceco_community_list: "Liste des guichets",
    espaceco_create_community: "Création d'un guichet",
    espaceco_manage_community: "Gérer le guichet",
    espaceco_member_invitation: "Invitation",

    datastore_upload_details: "",
    datastore_pyramid_vector_generate: "",
    config_alerts: "",
};

export function matomoPageTitle(route: Route<typeof routes>): string {
    let prefix = "[Publier]";
    let label: string;

    if (route.name === false) {
        label = matomoPageLabels.page_not_found!;
    } else {
        if (route.name.match("espaceco")) {
            prefix = "[Contribuer]";
        }
        label = matomoPageLabels[route.name] ?? route.name;
    }

    return `${prefix} ${label}`;
}

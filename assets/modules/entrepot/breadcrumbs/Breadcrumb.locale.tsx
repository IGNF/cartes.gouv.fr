import { declareComponentKeys } from "../../../i18n/i18n";
import { Translations } from "../../../i18n/types";

const { i18n } = declareComponentKeys<
    | "dashboard_pro"
    | "about"
    | "contact"
    | "contact_thanks"
    | "news"
    | "faq"
    | "sitemap"
    | "accessibility"
    | "legal_notice"
    | "personal_data"
    | "offer"
    | "join"
    | "terms_of_service"
    | "service_status"
    | "accesses_request"
    | "my_account"
    | "my_access_keys"
    | "user_key_add"
    | "user_key_edit"
    | "datastore_create_request"
    | "datastore_create_request_confirm"
    | "join_community"
    | "members_list"
    | "datastore_manage_storage"
    | "datastore_manage_permissions"
    | "datastore_add_permission"
    | "datastore_edit_permission"
    | "datastore_create_datasheet"
    | "upload"
    | "datastore_datasheet_upload_integration"
    | "datastore_stored_data_details"
    | "datastore_upload_details"
    | "datastore_wfs_service_new"
    | "datastore_wfs_service_edit"
    | "datastore_wms_vector_service_new"
    | "datastore_wms_vector_service_edit"
    | "datastore_pyramid_vector_generate"
    | "datastore_pyramid_vector_tms_service_new"
    | "datastore_pyramid_vector_tms_service_edit"
    | "datastore_pyramid_raster_generate"
    | "datastore_pyramid_raster_wms_raster_service_new"
    | "datastore_pyramid_raster_wms_raster_service_edit"
    | "datastore_pyramid_raster_wmts_service_new"
    | "datastore_pyramid_raster_wmts_service_edit"
    | "datastore_service_view"
>()("Breadcrumb");
export type I18n = typeof i18n;

export const BreadcrumbFrTranslations: Translations<"fr">["Breadcrumb"] = {
    dashboard_pro: "Tableau de bord",
    about: "A propos",
    contact: "Nous écrire",
    contact_thanks: "Demande envoyée",
    news: "Actualités",
    faq: "Questions fréquentes",
    sitemap: "Plan du site",
    accessibility: "Accessibilité",
    legal_notice: "Mentions légales",
    personal_data: "Données à caractère personnel",
    offer: "Offre",
    join: "Nous rejoindre",
    terms_of_service: "Conditions générales d'utilisation",
    service_status: "Niveau de service",
    accesses_request: "Demande d'accès à un service privé",
    my_account: "Mon compte",
    my_access_keys: "Mes clés d'accès",
    user_key_add: "Création d'une clé",
    user_key_edit: "Modification d'une clé",
    datastore_create_request: "Demande de création d'un espace de travail",
    datastore_create_request_confirm: "Demande envoyée",
    join_community: "Rejoindre un espace de travail existant",
    members_list: "Membres",
    datastore_manage_storage: "Suivi des consommations",
    datastore_manage_permissions: "Permissions accordées",
    datastore_add_permission: "Ajout d'une permission",
    datastore_edit_permission: "Modification d'une permission",
    datastore_create_datasheet: "Création d'une fiche de données",
    upload: "Téléversement",
    datastore_datasheet_upload_integration: "Intégration de données",
    datastore_stored_data_details: "Détails d'une donnée stockée",
    datastore_upload_details: "Détails d'une livraison",
    datastore_wfs_service_new: "Création d'un service WFS",
    datastore_wfs_service_edit: "Modification d'un service WFS",
    datastore_wms_vector_service_new: "Création d'un service WMS-Vecteur",
    datastore_wms_vector_service_edit: "Modification d'un service WMS-Vecteur",
    datastore_pyramid_vector_generate: "Génération d'une pyramide vecteur",
    datastore_pyramid_vector_tms_service_new: "Création d'un service TMS",
    datastore_pyramid_vector_tms_service_edit: "Modification d'un service TMS",
    datastore_pyramid_raster_generate: "Génération d'une pyramide raster",
    datastore_pyramid_raster_wms_raster_service_new: "Création d'un service WMS-Raster",
    datastore_pyramid_raster_wms_raster_service_edit: "Modification d'un service WMS-Raster",
    datastore_pyramid_raster_wmts_service_new: "Création d'un service WMTS",
    datastore_pyramid_raster_wmts_service_edit: "Modification d'un service WMTS",
    datastore_service_view: "Prévisualisation d'un service",
};

export const BreadcrumbEnTranslations: Translations<"en">["Breadcrumb"] = {
    dashboard_pro: "Dashboard",
    about: "About",
    contact: "Contact us",
    contact_thanks: "Request sent",
    news: "News",
    faq: "frequently asked questions",
    sitemap: "Sitemap",
    accessibility: "Accessibility",
    legal_notice: "Legal notice",
    personal_data: "Personal data",
    offer: "Offer",
    join: "Join us",
    terms_of_service: "Terms of Service",
    service_status: "TODO",
    accesses_request: "Request to private resources",
    my_account: "My account",
    my_access_keys: "My access keys",
    user_key_add: "Create key",
    user_key_edit: "Modify key",
    datastore_create_request: "Request to create a workspace",
    datastore_create_request_confirm: "Request sent",
    join_community: "Join an existing workspace",
    members_list: "Members",
    datastore_manage_storage: "Consumption monitoring",
    datastore_manage_permissions: "Permissions granted",
    datastore_add_permission: "Add permission",
    datastore_edit_permission: "Modify permission",
    datastore_create_datasheet: "Create datasheet",
    upload: "Upload",
    datastore_datasheet_upload_integration: "Data integration",
    datastore_stored_data_details: "Details of stored data",
    datastore_upload_details: "Details of upload",
    datastore_wfs_service_new: "Create a WFS service",
    datastore_wfs_service_edit: "Modify WFS service",
    datastore_wms_vector_service_new: "Create a WMS-Vector service",
    datastore_wms_vector_service_edit: "Modify a WMS-Vector service",
    datastore_pyramid_vector_generate: "Generate a vector pyramid",
    datastore_pyramid_vector_tms_service_new: "Create a TMS service",
    datastore_pyramid_vector_tms_service_edit: "Modify a TMS service",
    datastore_pyramid_raster_generate: "Generate raster pyramid",
    datastore_pyramid_raster_wms_raster_service_new: "Create a WMS-Raster service",
    datastore_pyramid_raster_wms_raster_service_edit: "Modify a WMS-Raster service",
    datastore_pyramid_raster_wmts_service_new: "Create a WMTS service",
    datastore_pyramid_raster_wmts_service_edit: "Modify a WMTS service",
    datastore_service_view: "Preview a service",
};

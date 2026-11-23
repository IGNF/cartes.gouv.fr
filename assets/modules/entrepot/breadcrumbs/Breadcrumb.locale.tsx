import { declareComponentKeys } from "../../../i18n/i18n";
import { Translations } from "../../../i18n/types";

const { i18n } = declareComponentKeys<
    | "dashboard"
    | "discover_publish"
    | "datastore_selection"
    | "accesses_request"
    | "stats_scope_selection"
    | "my_account"
    | "my_access_keys"
    | "my_permissions"
    | "user_key_add"
    | "user_key_edit"
    | "datastore_create_request"
    | "join_community"
    | "community_info"
    | "members_list"
    | "datastore_manage_storage"
    | "datastore_manage_permissions"
    | "datastore_add_permission"
    | "datastore_edit_permission"
    | "datastore_create_datasheet"
    | "upload"
    | "datastore_datasheet_service_add"
    | "datastore_datasheet_service_view"
    | "datastore_datasheet_upload_integration"
    | "datastore_stored_data_details"
    | "datastore_upload_details"
    | "datastore_pyramid_vector_generate"
    | "datastore_pyramid_raster_generate"
    | "datastore_service_style_add"
    | "datastore_service_style_edit"
    | "espaceco_community_list"
    | "espaceco_member_invitation"
    | "espaceco_create_community"
    | "espaceco_manage_community"
>()("Breadcrumb");
export type I18n = typeof i18n;

export const BreadcrumbFrTranslations: Translations<"fr">["Breadcrumb"] = {
    dashboard: "Tableau de bord",
    discover_publish: "Publier",
    datastore_selection: "Entrepôts",
    accesses_request: "Demande d'accès à un service privé",
    stats_scope_selection: "Statistiques de consommation",
    my_account: "Mon compte",
    my_access_keys: "Mes clés d'accès",
    my_permissions: "Mes permissions",
    user_key_add: "Création d'une clé",
    user_key_edit: "Modification d'une clé",
    datastore_create_request: "Créer un nouvel entrepôt",
    join_community: "Rejoindre un entrepôt existant",
    community_info: "Info",
    members_list: "Membres",
    datastore_manage_storage: "Suivi des consommations",
    datastore_manage_permissions: "Permissions accordées",
    datastore_add_permission: "Ajout d'une permission",
    datastore_edit_permission: "Modification d'une permission",
    datastore_create_datasheet: "Création d'une fiche de données",
    upload: "Ajouter une donnée",
    datastore_datasheet_service_add: "Créer un flux",
    datastore_datasheet_service_view: "Flux",
    datastore_datasheet_upload_integration: "Intégration de données",
    datastore_stored_data_details: "Détails d’une donnée stockée",
    datastore_upload_details: "Détails d’une livraison",
    datastore_pyramid_vector_generate: "Génération d'une pyramide vecteur",
    datastore_pyramid_raster_generate: "Génération d'une pyramide raster",
    datastore_service_style_add: "Ajouter un style",
    datastore_service_style_edit: "Modifier le style",
    espaceco_community_list: "Espace collaboratif",
    espaceco_create_community: "Création d'un guichet",
    espaceco_manage_community: "Gérer le guichet",
    espaceco_member_invitation: "Invitation",
};

export const BreadcrumbEnTranslations: Translations<"en">["Breadcrumb"] = {
    dashboard: "Dashboard",
    discover_publish: "Publish",
    datastore_selection: "Datastores",
    accesses_request: "Request to private resources",
    stats_scope_selection: "Consumption statistics",
    my_account: "My account",
    my_access_keys: "My access keys",
    my_permissions: "My permissions",
    user_key_add: "Create key",
    user_key_edit: "Modify key",
    datastore_create_request: "Request to create a workspace",
    join_community: "Join an existing workspace",
    community_info: "Info",
    members_list: "Members",
    datastore_manage_storage: "Consumption monitoring",
    datastore_manage_permissions: "Permissions granted",
    datastore_add_permission: "Add permission",
    datastore_edit_permission: "Modify permission",
    datastore_create_datasheet: "Create datasheet",
    upload: "Add data",
    datastore_datasheet_service_add: "Create a service",
    datastore_datasheet_service_view: "Service",
    datastore_datasheet_upload_integration: "Data integration",
    datastore_stored_data_details: "Details of stored data",
    datastore_upload_details: "Details of upload",
    datastore_pyramid_vector_generate: "Generate a vector pyramid",
    datastore_pyramid_raster_generate: "Generate raster pyramid",
    datastore_service_style_add: "Add a style",
    datastore_service_style_edit: "Modify style",
    espaceco_community_list: "Collaborative space",
    espaceco_create_community: "Create community",
    espaceco_manage_community: "Manage community",
    espaceco_member_invitation: "Invitation",
};

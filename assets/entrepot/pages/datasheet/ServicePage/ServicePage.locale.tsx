import { ConfigurationStatus } from "@/@types/entrepot";
import { declareComponentKeys } from "@/i18n";
import { type Translations } from "@/i18n/types";

const { i18n } = declareComponentKeys<
    | "loading"
    | "load_error"
    | { K: "type_tag"; P: { type: string }; R: string }
    | "save"
    | "edit.saving"
    | "edit.success"
    | "edit.error"
    | "edit.locked"
    | "edit.busy"
    | "edit.permissions_error"
    | "edit.tables_error"
    | "leave.title"
    | "leave.description"
    | "leave.stay"
    | "leave.confirm"
    | "unpublishing.title"
    | "unpublished.title"
    | "unavailable.description"
    | "unstable.title"
    | "unstable.description"
    | "share_url"
    | "explore_maps"
    | "permissions.title"
    | "permissions.manage"
    | "section.preview"
    | "preview.restricted"
    | "preview.no_bbox"
    | "section.report"
    | "report.configuration"
    | "report.offering"
    | "report.id"
    | "report.name"
    | "report.status"
    | "report.creation"
    | "report.update"
    | { K: "report.configuration_status"; P: { status: ConfigurationStatus }; R: string }
>()("ServicePage");
export type I18n = typeof i18n;

const configurationStatusFr: Record<ConfigurationStatus, string> = {
    [ConfigurationStatus.PUBLISHED]: "Publiée",
    [ConfigurationStatus.UNPUBLISHED]: "Non publiée",
    [ConfigurationStatus.SYNCHRONIZING]: "En cours de synchronisation",
};

const configurationStatusEn: Record<ConfigurationStatus, string> = {
    [ConfigurationStatus.PUBLISHED]: "Published",
    [ConfigurationStatus.UNPUBLISHED]: "Unpublished",
    [ConfigurationStatus.SYNCHRONIZING]: "Synchronizing",
};

export const ServicePageFrTranslations: Translations<"fr">["ServicePage"] = {
    loading: "Chargement du flux",
    load_error: "Le flux n’a pas pu être chargé",
    type_tag: ({ type }) => `FLUX ${type}`,
    save: "Enregistrer",
    "edit.saving": "Enregistrement du flux",
    "edit.success": "Les modifications du flux sont enregistrées",
    "edit.error": "Les modifications du flux n’ont pas pu être enregistrées",
    "edit.locked": "Modification impossible pour le moment",
    "edit.busy": "Le flux est en cours de publication ou de modification. Rechargez la page dans quelques minutes.",
    "edit.permissions_error": "Les permissions de l’entrepôt n’ont pas pu être lues : l’accès actuel du flux est inconnu.",
    "edit.tables_error": "Les tables du jeu de données n’ont pas pu être lues.",
    "leave.title": "Quitter sans enregistrer ?",
    "leave.description": "Les modifications du flux ne sont pas enregistrées. Elles seront perdues si vous quittez la page.",
    "leave.stay": "Rester sur la page",
    "leave.confirm": "Quitter sans enregistrer",
    "unpublishing.title": "Flux en cours de dépublication",
    "unpublished.title": "Flux dépublié",
    "unavailable.description": "Ce flux n’est plus diffusé. Vous pouvez uniquement terminer sa dépublication depuis l’onglet Flux de la fiche.",
    "unstable.title": "Flux instable",
    "unstable.description": "L’Entrepôt considère ce flux comme instable. Il peut ne pas s’afficher correctement.",
    share_url: "URL de diffusion",
    explore_maps: "Lien de visualisation dans Explorer les cartes",
    "permissions.title": "Permissions",
    "permissions.manage": "Gérer les permissions",
    "section.preview": "Aperçu",
    "preview.restricted": "Aperçu indisponible : ce flux est restreint, il ne s’affiche qu’avec une clé d’accès.",
    "preview.no_bbox": "Aperçu indisponible : l’emprise du flux est inconnue.",
    "section.report": "Rapport de génération",
    "report.configuration": "Configuration",
    "report.offering": "Offre",
    "report.id": "Identifiant",
    "report.name": "Nom",
    "report.status": "Statut",
    "report.creation": "Date de création",
    "report.update": "Date de modification",
    "report.configuration_status": ({ status }) => configurationStatusFr[status] ?? status,
};

export const ServicePageEnTranslations: Translations<"en">["ServicePage"] = {
    loading: "Loading the service",
    load_error: "The service could not be loaded",
    type_tag: ({ type }) => `${type} SERVICE`,
    save: "Save",
    "edit.saving": "Saving the service",
    "edit.success": "The service changes are saved",
    "edit.error": "The service changes could not be saved",
    "edit.locked": "Editing unavailable for now",
    "edit.busy": "The service is being published or modified. Reload the page in a few minutes.",
    "edit.permissions_error": "The datastore permissions could not be read: the current access of the service is unknown.",
    "edit.tables_error": "The dataset tables could not be read.",
    "leave.title": "Leave without saving?",
    "leave.description": "The service changes are not saved. They will be lost if you leave the page.",
    "leave.stay": "Stay on the page",
    "leave.confirm": "Leave without saving",
    "unpublishing.title": "Service being unpublished",
    "unpublished.title": "Unpublished service",
    "unavailable.description": "This service is no longer broadcast. You can only finish unpublishing it from the Services tab of the datasheet.",
    "unstable.title": "Unstable service",
    "unstable.description": "The Entrepôt considers this service unstable. It may not display correctly.",
    share_url: "Broadcast URL",
    explore_maps: "Link to view in Explorer les cartes",
    "permissions.title": "Permissions",
    "permissions.manage": "Manage permissions",
    "section.preview": "Preview",
    "preview.restricted": "Preview unavailable: this service is restricted, it only displays with an access key.",
    "preview.no_bbox": "Preview unavailable: the service extent is unknown.",
    "section.report": "Generation report",
    "report.configuration": "Configuration",
    "report.offering": "Offering",
    "report.id": "Identifier",
    "report.name": "Name",
    "report.status": "Status",
    "report.creation": "Creation date",
    "report.update": "Last update",
    "report.configuration_status": ({ status }) => configurationStatusEn[status] ?? status,
};

import { declareComponentKeys } from "@/i18n";
import { type Translations } from "@/i18n/types";

const { i18n } = declareComponentKeys<
    | "title"
    | "banner.title"
    | "banner.link"
    | "create"
    | "or"
    | "reference_existing"
    | "no_service"
    | "load_error"
    | "filter_legend"
    | "filter.all"
    | { K: "results"; P: { count: number }; R: string }
    | { K: "per_page"; P: { count: number }; R: string }
    | "caption"
    | "column.name"
    | "column.access"
    | "column.url"
    | "column.explore"
    | "column.update"
    | "column.status"
    | "column.action"
    | "column.menu"
    | "view"
    | "menu.open"
    | "menu.copy_url"
    | "explore.link_title"
    | "menu.edit"
    | "menu.delete"
    | "access.public"
    | "access.private"
    | "access.private_visible"
    | "access.private_visible_title"
    | "explore.pending"
    | "explore.link"
    | "explore.unavailable_title"
    | "url.unavailable"
    | "url.copy"
    | "copy_dialog.title"
    | "copy_dialog.label"
    | { K: "delete_modal.title"; P: { name: string }; R: string }
    | "delete_modal.cancel"
    | "delete_modal.confirm"
    | "delete_modal.items"
    | { K: "delete_modal.offering"; P: { id: string }; R: string }
    | { K: "delete_modal.configuration"; P: { id: string }; R: string }
    | "deleting"
    | "delete_error"
>()("ServicesListTabNext");

export type I18n = typeof i18n;

export const ServicesListTabNextFrTranslations: Translations<"fr">["ServicesListTabNext"] = {
    title: "Flux",
    "banner.title": "Chaque type de flux est adapté à un besoin particulier. Renseignez-vous avant de publier.",
    "banner.link": "Comparer les différents flux dans l’aide",
    create: "Créer un flux",
    or: "ou",
    reference_existing: "Référencer un flux existant",
    no_service: "Aucun flux",
    load_error: "Les flux n’ont pas pu être chargés",
    filter_legend: "Filtrer par type de flux",
    "filter.all": "Tous",
    results: ({ count }) => `${count} résultat${count > 1 ? "s" : ""}`,
    per_page: ({ count }) => `${count} résultats par page`,
    caption: "Flux",
    "column.name": "Flux",
    "column.access": "Accès",
    "column.url": "URL",
    "column.explore": "Explorer",
    "column.update": "Date de modification",
    "column.status": "Statut",
    "column.action": "Action",
    "column.menu": "Autres actions",
    view: "Consulter",
    "menu.open": "Autres actions",
    "menu.copy_url": "Copier l’URL",
    "explore.link_title": "Voir dans Explorer les cartes",
    "menu.edit": "Mettre à jour",
    "menu.delete": "Supprimer",
    "access.public": "Public",
    "access.private": "Privé",
    "access.private_visible": "Privé*",
    "access.private_visible_title": "Le flux est privé mais reste disponible à la visualisation pour tous les utilisateurs sur cartes.gouv.fr",
    "explore.pending": "En cours",
    "explore.link": "Lien",
    "explore.unavailable_title": "Ce flux n’est pas visualisable dans Explorer les cartes",
    "url.unavailable": "URL de diffusion indisponible",
    "url.copy": "Copier l’URL",
    "copy_dialog.title": "Copier l’URL",
    "copy_dialog.label": "URL de diffusion",
    "delete_modal.title": ({ name }) => `Êtes-vous sûr de vouloir supprimer le flux ${name} ?`,
    "delete_modal.cancel": "Non, annuler",
    "delete_modal.confirm": "Oui, supprimer",
    "delete_modal.items": "Les éléments suivants seront supprimés :",
    "delete_modal.offering": ({ id }) => `1 offre (${id})`,
    "delete_modal.configuration": ({ id }) => `1 configuration (${id})`,
    deleting: "Suppression du flux en cours",
    delete_error: "Le flux n’a pas été supprimé",
};

export const ServicesListTabNextEnTranslations: Translations<"en">["ServicesListTabNext"] = {
    title: "Services",
    "banner.title": "Each service type fits a specific need. Learn more before publishing.",
    "banner.link": "Compare service types in the help",
    create: "Create a service",
    or: "or",
    reference_existing: "Reference an existing service",
    no_service: "No service",
    load_error: "The services could not be loaded",
    filter_legend: "Filter by service type",
    "filter.all": "All",
    results: ({ count }) => `${count} result${count > 1 ? "s" : ""}`,
    per_page: ({ count }) => `${count} results per page`,
    caption: "Services",
    "column.name": "Service",
    "column.access": "Access",
    "column.url": "URL",
    "column.explore": "Explore",
    "column.update": "Last modified",
    "column.status": "Status",
    "column.action": "Action",
    "column.menu": "More actions",
    view: "View",
    "menu.open": "More actions",
    "menu.copy_url": "Copy URL",
    "explore.link_title": "View in Explore maps",
    "menu.edit": "Update",
    "menu.delete": "Delete",
    "access.public": "Public",
    "access.private": "Private",
    "access.private_visible": "Private*",
    "access.private_visible_title": "The service is private but remains viewable by all users on cartes.gouv.fr",
    "explore.pending": "In progress",
    "explore.link": "Link",
    "explore.unavailable_title": "This service cannot be viewed in Explore maps",
    "url.unavailable": "Service URL unavailable",
    "url.copy": "Copy URL",
    "copy_dialog.title": "Copy URL",
    "copy_dialog.label": "Service URL",
    "delete_modal.title": ({ name }) => `Are you sure you want to delete the service ${name}?`,
    "delete_modal.cancel": "No, cancel",
    "delete_modal.confirm": "Yes, delete",
    "delete_modal.items": "The following items will be deleted:",
    "delete_modal.offering": ({ id }) => `1 offering (${id})`,
    "delete_modal.configuration": ({ id }) => `1 configuration (${id})`,
    deleting: "Deleting the service",
    delete_error: "The service was not deleted",
};

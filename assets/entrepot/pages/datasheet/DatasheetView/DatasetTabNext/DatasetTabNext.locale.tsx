import { declareComponentKeys } from "@/i18n";
import { type Translations } from "@/i18n/types";

const { i18n } = declareComponentKeys<
    | "title"
    | "add"
    | "no_data"
    | "load_error"
    | "filter_legend"
    | "filter.all"
    | "filter.vector"
    | "filter.raster"
    | { K: "results"; P: { count: number }; R: string }
    | "caption"
    | "column.name"
    | "column.type"
    | "column.creation"
    | "column.status"
    | "column.action"
    | "type.vector_db"
    | "type.pyramid_vector"
    | "type.pyramid_raster"
    | "status.failed"
    | "status.in_progress"
    | "view"
    | "menu.open"
    | "menu.generate_pyramid_vector"
    | "menu.delete"
    | "view_report"
    | "resume_integration"
    | "delete"
    | "deleting"
    | "delete_error"
    | "loading_notice.title"
    | "loading_notice.description"
    | "banner.vector_only"
    | "banner.raster_help"
    | "banner.help_link"
    | "banner.tools"
    | "banner.api"
    | "banner.qgis"
>()("DatasetTabNext");

export type I18n = typeof i18n;

export const DatasetTabNextFrTranslations: Translations<"fr">["DatasetTabNext"] = {
    title: "Données",
    add: "Ajouter une donnée",
    no_data: "Aucune donnée",
    load_error: "La fiche de données n’a pas pu être chargée",
    filter_legend: "Filtrer par type de donnée",
    "filter.all": "Tous",
    "filter.vector": "Vecteur",
    "filter.raster": "Raster",
    results: ({ count }) => `${count} résultat${count > 1 ? "s" : ""}`,
    caption: "Jeux de données",
    "column.name": "Jeu de données",
    "column.type": "Type",
    "column.creation": "Date de création",
    "column.status": "Statut",
    "column.action": "Action",
    "type.vector_db": "Base vecteur",
    "type.pyramid_vector": "Pyramide vecteur",
    "type.pyramid_raster": "Pyramide raster",
    "status.failed": "Échoué",
    "status.in_progress": "En cours",
    view: "Consulter",
    "menu.open": "Autres actions",
    "menu.generate_pyramid_vector": "Créer une pyramide vecteur",
    "menu.delete": "Supprimer",
    view_report: "Voir le rapport",
    resume_integration: "Reprendre l’intégration",
    delete: "Supprimer",
    deleting: "Suppression de la livraison en cours",
    delete_error: "La livraison n’a pas été supprimée",
    "loading_notice.title": "Donnée en cours de chargement",
    "loading_notice.description": "Vous recevrez un courriel vous indiquant la fin du chargement.",
    "banner.vector_only": "Ajouter uniquement vos données vecteur depuis cartes.gouv.fr",
    "banner.raster_help": "Pour ajouter vos données raster",
    "banner.help_link": "Consulter l’aide",
    "banner.tools": "Ajouter vos données directement depuis vos outils :",
    "banner.api": "Depuis une API",
    "banner.qgis": "Depuis QGIS",
};

export const DatasetTabNextEnTranslations: Translations<"en">["DatasetTabNext"] = {
    title: "Data",
    add: "Add data",
    no_data: "No data",
    load_error: "The datasheet could not be loaded",
    filter_legend: "Filter by data type",
    "filter.all": "All",
    "filter.vector": "Vector",
    "filter.raster": "Raster",
    results: ({ count }) => `${count} result${count > 1 ? "s" : ""}`,
    caption: "Datasets",
    "column.name": "Dataset",
    "column.type": "Type",
    "column.creation": "Creation date",
    "column.status": "Status",
    "column.action": "Action",
    "type.vector_db": "Vector database",
    "type.pyramid_vector": "Vector pyramid",
    "type.pyramid_raster": "Raster pyramid",
    "status.failed": "Failed",
    "status.in_progress": "In progress",
    view: "View",
    "menu.open": "More actions",
    "menu.generate_pyramid_vector": "Create a vector pyramid",
    "menu.delete": "Delete",
    view_report: "View report",
    resume_integration: "Resume integration",
    delete: "Delete",
    deleting: "Deleting the upload",
    delete_error: "The upload was not deleted",
    "loading_notice.title": "Data being loaded",
    "loading_notice.description": "You will receive an email when loading is complete.",
    "banner.vector_only": "Only vector data can be added from cartes.gouv.fr",
    "banner.raster_help": "To add raster data",
    "banner.help_link": "See the help",
    "banner.tools": "Add data directly from your tools:",
    "banner.api": "From an API",
    "banner.qgis": "From QGIS",
};

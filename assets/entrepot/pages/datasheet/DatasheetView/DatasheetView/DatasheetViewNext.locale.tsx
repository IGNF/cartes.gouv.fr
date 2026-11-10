import { declareComponentKeys } from "@/i18n";
import { type Translations } from "@/i18n/types";

const { i18n } = declareComponentKeys<
    | "tab.description"
    | "tab.dataset"
    | "tab.services"
    | "published"
    | "not_published"
    | "publish"
    | "unpublish"
    | "delete"
    | "other_actions"
    | "catalogue_link"
    | "publish_requires_description"
    | "thumbnail_alt"
    | "load_error"
    | "publish_modal.title"
    | "publish_modal.text"
    | "publish_modal.live_updates"
    | "unpublish_modal.title"
    | "unpublish_modal.text"
    | "publishing"
    | "unpublishing"
    | "publish_error"
    | "unpublish_error"
    | "delete_error"
>()("DatasheetViewNext");

export type I18n = typeof i18n;

export const DatasheetViewNextFrTranslations: Translations<"fr">["DatasheetViewNext"] = {
    "tab.description": "Description",
    "tab.dataset": "Données",
    "tab.services": "Flux",
    published: "Publié",
    not_published: "Non publié",
    publish: "Publier",
    unpublish: "Dépublier",
    delete: "Supprimer",
    other_actions: "Autres actions",
    catalogue_link: "Lien vers le catalogue",
    publish_requires_description: "Complétez l’onglet Description pour pouvoir publier la fiche de données.",
    thumbnail_alt: "Vignette de la fiche de données",
    load_error: "La fiche de données n’a pas pu être chargée",
    "publish_modal.title": "Publier la fiche de données",
    "publish_modal.text":
        "Votre fiche de données sera visible dans le catalogue de cartes.gouv.fr via Rechercher une donnée. Les jeux de données et flux que vous avez rendus publics seront accessibles à tous.",
    "publish_modal.live_updates": "Chaque modification que vous apportez à votre fiche sera publiée instantanément.",
    "unpublish_modal.title": "Dépublier la fiche de données",
    "unpublish_modal.text":
        "Votre fiche de données ne sera plus visible dans le catalogue de cartes.gouv.fr via Rechercher une donnée ou Explorer les cartes. Les jeux de données et flux auxquels vous avez accordé des permissions resteront accessibles.",
    publishing: "Publication en cours",
    unpublishing: "Dépublication en cours",
    publish_error: "La fiche de données n’a pas été publiée",
    unpublish_error: "La fiche de données n’a pas été dépubliée",
    delete_error: "La fiche de données n’a pas été supprimée",
};

export const DatasheetViewNextEnTranslations: Translations<"en">["DatasheetViewNext"] = {
    "tab.description": "Description",
    "tab.dataset": "Data",
    "tab.services": "Services",
    published: "Published",
    not_published: "Not published",
    publish: "Publish",
    unpublish: "Unpublish",
    delete: "Delete",
    other_actions: "Other actions",
    catalogue_link: "Link to the catalogue",
    publish_requires_description: "Complete the Description tab to publish this datasheet.",
    thumbnail_alt: "Datasheet thumbnail",
    load_error: "The datasheet could not be loaded",
    "publish_modal.title": "Publish the datasheet",
    "publish_modal.text":
        "Your datasheet will be visible in the cartes.gouv.fr catalogue. The datasets and services you made public will be accessible to everyone.",
    "publish_modal.live_updates": "Every change you make to your datasheet will be published immediately.",
    "unpublish_modal.title": "Unpublish the datasheet",
    "unpublish_modal.text":
        "Your datasheet will no longer be visible in the cartes.gouv.fr catalogue. The datasets and services you granted permissions on will remain accessible.",
    publishing: "Publishing",
    unpublishing: "Unpublishing",
    publish_error: "The datasheet was not published",
    unpublish_error: "The datasheet was not unpublished",
    delete_error: "The datasheet was not deleted",
};

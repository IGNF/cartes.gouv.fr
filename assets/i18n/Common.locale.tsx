import { formatDateFromISO } from "@/utils";
import { declareComponentKeys } from "./i18n";
import { type Translations } from "./types";

const { i18n } = declareComponentKeys<
    | "warning"
    | "error"
    | "retry"
    | "add"
    | "adding"
    | "modify"
    | "apply"
    | "record"
    | "modifying"
    | "removing"
    | "continue"
    | "save"
    | "copy"
    | "cancel"
    | "delete"
    | "see_2"
    | "yes"
    | "no"
    | "unpublish"
    | "information"
    | "no_necessary_rights"
    | "mandatory_fields"
    | "new_window"
    | "previous_step"
    | "next_step"
    | "url_copied"
    | "copy_to_clipboard"
    | "alert_copied"
    | "go_to_content"
    | "download"
    | "trimmed_error"
    | "search"
    | "clear"
    | "refresh"
    | "filter"
    | "remove_filters"
    | "select_option"
    | { K: "last_refresh_date"; P: { dataUpdatedAt: number }; R: string }
    | { K: "nb_results"; P: { displayed: number; total: number }; R: string }
    | { K: "datastore_name"; P: { name: string | undefined; isSandbox: boolean | undefined }; R: string | undefined }
    | "email_notification"
>()("Common");
export type I18n = typeof i18n;

export const commonFrTranslations: Translations<"fr">["Common"] = {
    warning: "Avertissement",
    error: "Une erreur est survenue",
    retry: "Réessayer",
    add: "Ajouter",
    adding: "Ajout en cours ...",
    modify: "Modifier",
    apply: "Appliquer",
    record: "Enregistrer",
    modifying: "Modification en cours ...",
    removing: "Suppression en cours ...",
    continue: "Continuer",
    save: "Sauvegarder",
    copy: "Copier",
    cancel: "Annuler",
    delete: "Supprimer",
    see_2: "Voir",
    yes: "Oui",
    no: "Non",
    unpublish: "Dépublier",
    information: "Information",
    no_necessary_rights: "Vous n'avez pas les droits nécessaires pour afficher cette page.",
    mandatory_fields: "Sauf mention contraire “(optionnel)” dans le label, tous les champs sont obligatoires.",
    new_window: "ouvre une nouvelle fenêtre",
    previous_step: "Étape précédente",
    next_step: "Étape suivante",
    url_copied: "URL copiée",
    copy_to_clipboard: "Copier dans le presse-papier",
    alert_copied: "Copié",
    go_to_content: "Aller au contenu",
    download: "Télécharger",
    trimmed_error: "La chaîne de caractères ne doit contenir aucun espace en début et fin",
    search: "Rechercher",
    clear: "Effacer",
    refresh: "Rafraîchir",
    filter: "Filtrer",
    remove_filters: "Retirer les filtres",
    select_option: "Sélectionner une option",
    last_refresh_date: ({ dataUpdatedAt }) => `Mise à jour le ${formatDateFromISO(new Date(dataUpdatedAt).toISOString())}`,
    nb_results: ({ displayed, total }) => {
        if (total === 0) return "Aucun résultat";
        if (total === 1) return "1 résultat affiché sur 1";
        return `${displayed} résultats affichés sur ${total}`;
    },
    datastore_name: ({ name, isSandbox }) => (isSandbox ? "Espace Découverte" : name),
    email_notification: "Être notifié par courriel à la fin de la génération",
};

export const commonEnTranslations: Translations<"en">["Common"] = {
    warning: "Warning",
    error: "An error occurred",
    retry: "Retry",
    add: "Add",
    adding: "Adding ...",
    modify: "Modify",
    apply: "Apply",
    record: "Record",
    modifying: "modifying ...",
    removing: "Removing ...",
    continue: "Continue",
    save: "Save",
    copy: "Copy",
    cancel: "Cancel",
    delete: "Delete",
    see_2: "View",
    yes: "Yes",
    no: "No",
    unpublish: "Unpublish",
    information: "Information",
    no_necessary_rights: "You do not have the necessary rights to view and modify the users of this community.",
    mandatory_fields: "All fields are mandatory unless label states “optional”",
    new_window: "new window",
    previous_step: "Previous step",
    next_step: "Next step",
    url_copied: "URL copied",
    copy_to_clipboard: "Copy to clipboard",
    alert_copied: "Copied",
    go_to_content: "Go to content",
    download: "Download",
    trimmed_error: "The character string must not contain any spaces at the beginning and end",
    search: "Search",
    clear: "Clear",
    refresh: undefined,
    filter: "Filter",
    remove_filters: "Remove the filters",
    select_option: "Select an option",
    last_refresh_date: undefined,
    nb_results: undefined,
    datastore_name: undefined,
    email_notification: undefined,
};

import { declareComponentKeys } from "./i18n";
import { type Translations } from "./types";

const { i18n } = declareComponentKeys<
    | "warning"
    | "error"
    | "add"
    | "adding"
    | "modify"
    | "apply"
    | "record"
    | "modifying"
    | "removing"
    | "loading"
    | "continue"
    | "validate"
    | "submit"
    | "save"
    | "copy"
    | "send"
    | "cancel"
    | "delete"
    | "see"
    | "yes"
    | "no"
    | "publish"
    | "unpublish"
    | "published"
    | "not_published"
    | "information"
    | "no_necessary_rights"
    | "mandatory_fields"
    | "none"
    | "new_window"
    | "previous_step"
    | "next_step"
    | "url_copied"
    | "copy_to_clipboard"
    | "go_to_content"
    | "trimmed_error"
>()("Common");
export type I18n = typeof i18n;

export const commonFrTranslations: Translations<"fr">["Common"] = {
    warning: "Avertissement",
    error: "Une erreur est survenue",
    add: "Ajouter",
    adding: "Ajout en cours ...",
    modify: "Modifier",
    apply: "Appliquer",
    record: "Enregistrer",
    modifying: "Modification en cours ...",
    removing: "Suppression en cours ...",
    loading: "Chargement ...",
    continue: "Continuer",
    validate: "Valider",
    submit: "Soumettre",
    save: "Sauvegarder",
    copy: "Copier",
    send: "Envoyer",
    cancel: "Annuler",
    delete: "Supprimer",
    see: "Consulter",
    yes: "Oui",
    no: "Non",
    publish: "Publier",
    unpublish: "Dépublier",
    published: "Publié",
    not_published: "Non publié",
    information: "Information",
    no_necessary_rights: "Vous n'avez pas les droits nécessaires pour afficher cette page.",
    mandatory_fields: "Sauf mention contraire “(optionnel)” dans le label, tous les champs sont obligatoires.",
    none: "Aucune",
    new_window: "ouvre une nouvelle fenêtre",
    previous_step: "Étape précédente",
    next_step: "Étape suivante",
    url_copied: "URL copiée",
    copy_to_clipboard: "Copier dans le presse-papier",
    go_to_content: "Aller au contenu",
    trimmed_error: "La chaîne de caractères ne doit contenir aucun espace en début et fin",
};

export const commonEnTranslations: Translations<"en">["Common"] = {
    warning: "Warning",
    error: "An error occurred",
    add: "Add",
    adding: "Adding ...",
    modify: "Modify",
    apply: "Apply",
    record: "Record",
    modifying: "modifying ...",
    removing: "Removing ...",
    loading: "Loading ...",
    continue: "Continue",
    validate: "Validate",
    submit: "Submit",
    save: "Save",
    copy: "Copy",
    send: "Send",
    cancel: "Cancel",
    delete: "Delete",
    see: "Check",
    yes: "Yes",
    no: "No",
    publish: "Publish",
    unpublish: "Unpublish",
    published: "Published",
    not_published: "Not published",
    information: "Information",
    no_necessary_rights: "You do not have the necessary rights to view and modify the users of this community.",
    mandatory_fields: "All fields are mandatory unless label states “optional”",
    none: "None",
    new_window: "new window",
    previous_step: "Previous step",
    next_step: "Next step",
    url_copied: "URL copied",
    copy_to_clipboard: "Copy to clipboard",
    go_to_content: "Go to content",
    trimmed_error: "The character string must not contain any spaces at the beginning and end",
};

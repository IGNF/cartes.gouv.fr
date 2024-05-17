import { declareComponentKeys, type Translations } from "./i18n";

export const { i18n } = declareComponentKeys<
    | "warning"
    | "error"
    | "add"
    | "adding"
    | "modify"
    | "modifying"
    | "removing"
    | "loading"
    | "continue"
    | "copy"
    | "send"
    | "cancel"
    | "delete"
    | "yes"
    | "no"
    | "publish"
    | "unpublish"
    | "published"
    | "not_published"
    | "information"
    | "mandatory_fields"
    | "none"
    | "new_window"
    | "previous_step"
    | "next_step"
>()("Common");

export const commonFrTranslations: Translations<"fr">["Common"] = {
    warning: "Avertissement",
    error: "Une erreur est survenue",
    add: "Ajouter",
    adding: "Ajout en cours ...",
    modify: "Modifier",
    modifying: "Modification en cours ...",
    removing: "Suppression en cours ...",
    loading: "Chargement ...",
    continue: "Continuer",
    copy: "Copier",
    send: "Envoyer",
    cancel: "Annuler",
    delete: "Supprimer",
    yes: "Oui",
    no: "Non",
    publish: "Publier",
    unpublish: "Dépublier",
    published: "Publié",
    not_published: "Non publié",
    information: "Information",
    mandatory_fields: "Sauf mention contraire “(optionnel)” dans le label, tous les champs sont obligatoires.",
    none: "Aucune",
    new_window: "ouvre une nouvelle fenêtre",
    previous_step: "Étape précédente",
    next_step: "Étape suivante",
};

export const commonEnTranslations: Translations<"en">["Common"] = {
    warning: "Warning",
    error: "An error occurred",
    add: "Add",
    adding: "Adding ...",
    modify: "Modify",
    modifying: "modifying ...",
    removing: "Removing ...",
    loading: "Loading ...",
    continue: "Continue",
    copy: "Copy",
    send: "Send",
    cancel: "Cancel",
    delete: "Delete",
    yes: "Yes",
    no: "No",
    publish: "Publish",
    unpublish: "Unpublish",
    published: "Published",
    not_published: "Not published",
    information: "Information",
    mandatory_fields: "All fields are mandatory unless label states “optional”",
    none: "None",
    new_window: "new window",
    previous_step: "Previous step",
    next_step: "Next step",
};

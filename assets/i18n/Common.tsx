import { declareComponentKeys, type Translations } from "./i18n";

export const { i18n } = declareComponentKeys<
    | "error"
    | "add"
    | "adding"
    | "modify"
    | "modifying"
    | "removing"
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
>()("Common");

export const commonFrTranslations: Translations<"fr">["Common"] = {
    error: "Une erreur est survenue",
    add: "Ajouter",
    adding: "Ajout en cours ...",
    modify: "Modifier",
    modifying: "Modification en cours ...",
    removing: "Suppression en cours ...",
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
};

export const commonEnTranslations: Translations<"en">["Common"] = {
    error: "An error occurred",
    add: "Add",
    adding: "Adding ...",
    modify: "Modify",
    modifying: "modifying ...",
    removing: "Removing ...",
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
};

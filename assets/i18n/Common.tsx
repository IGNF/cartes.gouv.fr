import { declareComponentKeys, type Translations } from "./i18n";

const Common = () => {
    return null;
};

export default Common;

export const { i18n } = declareComponentKeys<
    "error" | "add" | "modify" | "send" | "cancel" | "delete" | "being_deleted" | "yes" | "no" | "published" | "not_published"
>()({
    Common,
});

export const commonFrTranslations: Translations<"fr">["Common"] = {
    error: "Une erreur est survenue",
    add: "Ajouter",
    modify: "Modifier",
    send: "Envoyer",
    cancel: "Annuler",
    delete: "Supprimer",
    being_deleted: "En cours de suppression",
    yes: "Oui",
    no: "Non",
    published: "Publié",
    not_published: "Non publié",
};

export const commonEnTranslations: Translations<"en">["Common"] = {
    error: "Error is raised",
    add: "Add",
    modify: "Modify",
    send: "Send",
    cancel: "Cancel",
    delete: "Delete",
    being_deleted: "Being deleted",
    yes: "Yes",
    no: "No",
    published: "Published",
    not_published: "Not published",
};

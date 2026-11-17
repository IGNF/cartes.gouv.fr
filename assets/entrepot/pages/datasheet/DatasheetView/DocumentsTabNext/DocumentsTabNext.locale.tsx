import { declareComponentKeys } from "@/i18n";
import { type Translations } from "@/i18n/types";

const { i18n } = declareComponentKeys<
    | "title"
    | "add_file"
    | "add_link"
    | "empty.add_file"
    | "empty.add_link"
    | "or"
    | "no_document"
    | "load_error"
    | "filter_legend"
    | "filter.all"
    | "filter.files"
    | "filter.links"
    | { K: "results"; P: { count: number }; R: string }
    | { K: "per_page"; P: { count: number }; R: string }
    | "caption"
    | "column.name"
    | "column.format"
    | "column.creation"
    | "column.menu"
    | "format.link"
    | "new_window"
    | "menu.open"
    | "menu.edit"
    | "menu.download"
    | "menu.open_link"
    | "menu.copy_link"
    | "menu.delete"
    | "modal.add_file"
    | "modal.add_link"
    | "modal.edit_file"
    | "modal.edit_link"
    | "field.file_name"
    | "field.link_name"
    | "field.url"
    | "field.file"
    | "field.file_replace"
    | { K: "field.file_hint"; P: { max: number }; R: string }
    | "cancel"
    | "submit_add"
    | "submit_edit"
    | "delete_modal.title"
    | { K: "delete_modal.file"; P: { name: string }; R: string }
    | { K: "delete_modal.link"; P: { name: string }; R: string }
    | "delete_modal.confirm"
    | "copy_dialog.title"
    | "copy_dialog.label"
    | "saving"
    | "deleting"
    | "save_error"
    | "delete_error"
    | "download_error"
    | "validation.name.required"
    | "validation.url.required"
    | "validation.url.invalid"
    | "validation.url.domain"
    | "validation.file.required"
    | "validation.file.extension"
    | { K: "validation.file.size"; P: { max: number }; R: string }
>()("DocumentsTabNext");

export type I18n = typeof i18n;

export const DocumentsTabNextFrTranslations: Translations<"fr">["DocumentsTabNext"] = {
    title: "Annexes",
    add_file: "Document",
    add_link: "Lien",
    "empty.add_file": "Ajouter un document",
    "empty.add_link": "Ajouter un lien",
    or: "ou",
    no_document: "Aucune annexe",
    load_error: "Les annexes n’ont pas pu être chargées",
    filter_legend: "Filtrer par type d’annexe",
    "filter.all": "Tous",
    "filter.files": "Documents",
    "filter.links": "Liens",
    results: ({ count }) => `${count} résultat${count > 1 ? "s" : ""}`,
    per_page: ({ count }) => `${count} résultats par page`,
    caption: "Annexes",
    "column.name": "Nom",
    "column.format": "Format",
    "column.creation": "Date d’ajout",
    "column.menu": "Actions",
    "format.link": "URL",
    new_window: "ouvre une nouvelle fenêtre",
    "menu.open": "Autres actions",
    "menu.edit": "Modifier",
    "menu.download": "Télécharger",
    "menu.open_link": "Ouvrir dans le navigateur",
    "menu.copy_link": "Copier le lien",
    "menu.delete": "Supprimer",
    "modal.add_file": "Ajouter un document",
    "modal.add_link": "Ajouter un lien",
    "modal.edit_file": "Modifier le document",
    "modal.edit_link": "Modifier le lien",
    "field.file_name": "Nom du document",
    "field.link_name": "Nom du lien",
    "field.url": "URL du lien",
    "field.file": "Ajouter un fichier",
    "field.file_replace": "Remplacer le fichier (optionnel)",
    "field.file_hint": ({ max }) => `Taille maximale : ${max} Mo. Formats supportés : qgz, pdf, jpg, png, svg et csv.`,
    cancel: "Annuler",
    submit_add: "Ajouter",
    submit_edit: "Enregistrer",
    "delete_modal.title": "Supprimer",
    "delete_modal.file": ({ name }) => `Voulez-vous supprimer le document « ${name} » de votre fiche de données ?`,
    "delete_modal.link": ({ name }) => `Voulez-vous supprimer le lien « ${name} » de votre fiche de données ?`,
    "delete_modal.confirm": "Supprimer",
    "copy_dialog.title": "Copier le lien",
    "copy_dialog.label": "URL du lien",
    saving: "Enregistrement de l’annexe en cours",
    deleting: "Suppression de l’annexe en cours",
    save_error: "L’annexe n’a pas pu être enregistrée",
    delete_error: "L’annexe n’a pas pu être supprimée",
    download_error: "Le fichier n’a pas pu être téléchargé",
    "validation.name.required": "Le nom est obligatoire",
    "validation.url.required": "L’URL du lien est obligatoire",
    "validation.url.invalid": "L’URL du lien doit commencer par http:// ou https://",
    "validation.url.domain": "L’URL du lien doit contenir un nom de domaine",
    "validation.file.required": "Le fichier est obligatoire",
    "validation.file.extension": "Le fichier doit être au format qgz, pdf, jpg, png, svg ou csv",
    "validation.file.size": ({ max }) => `Le fichier ne peut pas dépasser ${max} Mo`,
};

export const DocumentsTabNextEnTranslations: Translations<"en">["DocumentsTabNext"] = {
    title: "Appendices",
    add_file: "Document",
    add_link: "Link",
    "empty.add_file": "Add a document",
    "empty.add_link": "Add a link",
    or: "or",
    no_document: "No appendix",
    load_error: "The appendices could not be loaded",
    filter_legend: "Filter by appendix type",
    "filter.all": "All",
    "filter.files": "Documents",
    "filter.links": "Links",
    results: ({ count }) => `${count} result${count > 1 ? "s" : ""}`,
    per_page: ({ count }) => `${count} results per page`,
    caption: "Appendices",
    "column.name": "Name",
    "column.format": "Format",
    "column.creation": "Date added",
    "column.menu": "Actions",
    "format.link": "URL",
    new_window: "opens a new window",
    "menu.open": "More actions",
    "menu.edit": "Edit",
    "menu.download": "Download",
    "menu.open_link": "Open in the browser",
    "menu.copy_link": "Copy the link",
    "menu.delete": "Delete",
    "modal.add_file": "Add a document",
    "modal.add_link": "Add a link",
    "modal.edit_file": "Edit the document",
    "modal.edit_link": "Edit the link",
    "field.file_name": "Document name",
    "field.link_name": "Link name",
    "field.url": "Link URL",
    "field.file": "Add a file",
    "field.file_replace": "Replace the file (optional)",
    "field.file_hint": ({ max }) => `Maximum size: ${max} MB. Supported formats: qgz, pdf, jpg, png, svg and csv.`,
    cancel: "Cancel",
    submit_add: "Add",
    submit_edit: "Save",
    "delete_modal.title": "Delete",
    "delete_modal.file": ({ name }) => `Do you want to delete the document “${name}” from your datasheet?`,
    "delete_modal.link": ({ name }) => `Do you want to delete the link “${name}” from your datasheet?`,
    "delete_modal.confirm": "Delete",
    "copy_dialog.title": "Copy the link",
    "copy_dialog.label": "Link URL",
    saving: "Saving the appendix",
    deleting: "Deleting the appendix",
    save_error: "The appendix could not be saved",
    delete_error: "The appendix could not be deleted",
    download_error: "The file could not be downloaded",
    "validation.name.required": "The name is required",
    "validation.url.required": "The link URL is required",
    "validation.url.invalid": "The link URL must start with http:// or https://",
    "validation.url.domain": "The link URL must contain a domain name",
    "validation.file.required": "The file is required",
    "validation.file.extension": "The file must be a qgz, pdf, jpg, png, svg or csv file",
    "validation.file.size": ({ max }) => `The file cannot exceed ${max} MB`,
};

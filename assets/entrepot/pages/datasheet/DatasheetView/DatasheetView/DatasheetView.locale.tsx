import { declareComponentKeys } from "i18nifty";
import { ThumbnailAction } from "../DatasheetThumbnail";
import { DatasheetDocument, DatasheetDocumentTypeEnum } from "../../../../../@types/app";
import { Translations } from "../../../../../i18n/types";
import { getFileExtension } from "../../../../../utils";

const { i18n } = declareComponentKeys<
    | "tab_label.metadata"
    | { K: "tab_label.datasets"; P: { num: number }; R: string }
    | { K: "tab_label.services"; P: { num: number }; R: string }
    | { K: "tab_label.documents"; P: { num: number }; R: string }
    | "datasheet.back_to_list"
    | "datasheet.remove"
    | { K: "datasheet.being_removed"; P: { datasheetName: string }; R: string }
    | "file_validation.required_error"
    | "file_validation.size_error"
    | "file_validation.format_error"
    | "button.title"
    | "thumbnail_modal.title"
    | "thumbnail_modal.file_hint"
    | { K: "thumbnail_modal.action_being"; P: { action: ThumbnailAction }; R: string }
    | { K: "thumbnail_action"; P: { action: ThumbnailAction }; R: string }
    | "thumbnail_confirm_delete_modal.title"
    | { K: "datasheet_confirm_delete_modal.title"; P: { datasheetName: string }; R: string }
    | "datasheet_confirm_delete_modal.text"
    | "metadata_tab.metadata.absent"
    | "metadata_tab.metadata.is_loading"
    | "services_tab.no_service"
    | "documents_tab.documents_list.is_loading"
    | "documents_tab.add_document"
    | "documents_tab.add_document.type.label"
    | { K: "documents_tab.add_document.type.options.label"; P: { docType: DatasheetDocumentTypeEnum }; R: string }
    | "documents_tab.add_document.in_progress"
    | "documents_tab.add_document.error.name_required"
    | { K: "documents_tab.add_document.error.extention_incorrect"; P: { fileExtension: string; acceptedExtensions: string[] }; R: string }
    | "documents_tab.add_document.error.extension_missing"
    | "documents_tab.add_document.error.file_required"
    | { K: "documents_tab.add_document.error.file_too_large"; P: { maxFileSize: number }; R: string }
    | "documents_tab.add_document.error.url_required"
    | "documents_tab.add_document.error.url_invalid"
    | "documents_tab.add_document.name.label"
    | "documents_tab.add_document.description.label"
    | "documents_tab.add_document.file.label"
    | { K: "documents_tab.add_document.file.hint"; P: { acceptedExtensions: string[] }; R: string }
    | "documents_tab.add_document.link.label"
    | { K: "documents_tab.delete_document.confirmation"; P: { display?: string }; R: string }
    | "documents_tab.delete_document.in_progress"
    | "documents_tab.list.no_documents"
    | { K: "documents_tab.list.document_type"; P: { doc: DatasheetDocument }; R: string }
    | { K: "documents_tab.edit_document"; P: { name?: string }; R: string }
    | "documents_tab.edit_document.in_progress"
>()("DatasheetView");
export type I18n = typeof i18n;

export const DatasheetViewFrTranslations: Translations<"fr">["DatasheetView"] = {
    "tab_label.metadata": "Métadonnées",
    "tab_label.datasets": ({ num }) => `Jeux de données (${num})`,
    "tab_label.services": ({ num }) => `Services (${num})`,
    "tab_label.documents": ({ num }) => `Documents (${num})`,
    "datasheet.back_to_list": "Retour à ma liste de données",
    "datasheet.remove": "Supprimer la fiche de données",
    "datasheet.being_removed": ({ datasheetName }) => `Suppression de la fiche de données ${datasheetName} en cours ...`,
    "file_validation.required_error": "Aucun fichier n'a été choisi",
    "file_validation.size_error": "La taille du fichier ne peut excéder 2 Mo",
    "file_validation.format_error": "Le fichier doit être au format jpeg ou png",
    "button.title": "Ajouter, modifier ou supprimer la vignette",
    "thumbnail_modal.title": "Vignette pour la fiche de données",
    "thumbnail_modal.file_hint": "Taille maximale : 2 Mo. Formats acceptés : jpg, png",
    "thumbnail_modal.action_being": ({ action }) => {
        switch (action) {
            case "add":
                return "Ajout de la vignette en cours ...";
            case "modify":
                return "Remplacement de la vignette en cours ...";
            case "delete":
                return "Suppression de la vignette en cours ...";
        }
    },
    thumbnail_action: ({ action }) => {
        switch (action) {
            case "add":
                return "Ajouter une vignette";
            case "modify":
                return "Remplacer la vignette";
            case "delete":
                return "Supprimer la vignette";
        }
    },
    "thumbnail_confirm_delete_modal.title": "Êtes-vous sûr de vouloir supprimer la vignette de cette fiche de données ?",
    "datasheet_confirm_delete_modal.title": ({ datasheetName }) => `Êtes-vous sûr de supprimer la fiche de données ${datasheetName} ?`,
    "datasheet_confirm_delete_modal.text": "Les éléments suivants seront supprimés :",
    "metadata_tab.metadata.absent":
        "Les métadonnées de cette fiche ne sont pas encore disponibles. Créez un premier service à partir d’un de vos jeux de données pour les compléter.",
    "metadata_tab.metadata.is_loading": "Les métadonnées sont en cours de chargement",
    "services_tab.no_service": "Aucun service publié. Créez un service à partir de l’onglet Jeux de données en choisissant une base de données d’origine.",
    "documents_tab.documents_list.is_loading": "Les documents sont en cours de chargement",
    "documents_tab.add_document": "Ajouter un document",
    "documents_tab.add_document.type.label": "Type de document",
    "documents_tab.add_document.type.options.label": ({ docType }) => {
        switch (docType) {
            case DatasheetDocumentTypeEnum.File:
                return "Fichier";
            case DatasheetDocumentTypeEnum.Link:
                return "Lien externe";
        }
    },
    "documents_tab.add_document.in_progress": "Ajout de document en cours",
    "documents_tab.add_document.error.name_required": "Le nom est obligatoire",
    "documents_tab.add_document.error.extention_incorrect": ({ fileExtension, acceptedExtensions }) => {
        let str = `L'extension ${fileExtension} n'est pas acceptée, `;

        if (acceptedExtensions.length === 1) {
            str += ` l'extension acceptée est ${acceptedExtensions[0]}`;
        } else {
            const lastExtension = acceptedExtensions.pop();

            str += `les extensions acceptées sont ${acceptedExtensions.join(", ")} et ${lastExtension}`;
        }

        return str;
    },
    "documents_tab.add_document.error.extension_missing": "Extension du fichier manquante",
    "documents_tab.add_document.error.file_required": "Le fichier est obligatoire",
    "documents_tab.add_document.error.file_too_large": ({ maxFileSize }) => `La taille du fichier téléversé ne peux excéder ${maxFileSize} Mo`,
    "documents_tab.add_document.error.url_required": "L'URL est obligatoire",
    "documents_tab.add_document.error.url_invalid": "L'URL est invalide",
    "documents_tab.add_document.name.label": "Nom du document",
    "documents_tab.add_document.description.label": "Description du document (optionnelle)",
    "documents_tab.add_document.file.label": "Téléverser un fichier",
    "documents_tab.add_document.file.hint": ({ acceptedExtensions }) => {
        let acceptedExtensionsStr: string;

        if (acceptedExtensions.length === 1) {
            acceptedExtensionsStr = acceptedExtensions[0];
        } else {
            const lastExtension = acceptedExtensions.pop();
            acceptedExtensionsStr = `${acceptedExtensions.join(", ")} ou ${lastExtension}`;
        }

        return `Fichier ${acceptedExtensionsStr} de moins de 5 Mo uniquement`;
    },
    "documents_tab.add_document.link.label": "Lien vers le document",
    "documents_tab.delete_document.confirmation": ({ display }) => `Êtes-vous sûr de vouloir supprimer le document ${display} ?`,
    "documents_tab.delete_document.in_progress": "Suppression du document en cours",
    "documents_tab.list.no_documents": "Il n'y a pas encore de documents liés à cette fiche de données.",
    "documents_tab.list.document_type": ({ doc }) => {
        if (doc.type === DatasheetDocumentTypeEnum.Link.valueOf()) {
            return "Lien externe";
        }

        const fileExtension = getFileExtension(doc.url)?.toLowerCase();

        switch (fileExtension) {
            case "pdf":
                return "PDF";
            case "qgz":
                return "Projet QGIS";
            default:
                return doc.type.toUpperCase();
        }
    },
    "documents_tab.edit_document": ({ name }) => `Modifier le document ${name}`,
    "documents_tab.edit_document.in_progress": "Modification du document en cours",
};

export const DatasheetViewEnTranslations: Translations<"en">["DatasheetView"] = {
    "tab_label.metadata": "Metadata",
    "tab_label.datasets": ({ num }) => `Datasets (${num})`,
    "tab_label.services": ({ num }) => `Services (${num})`,
    "tab_label.documents": ({ num }) => `Documents (${num})`,
    "datasheet.back_to_list": "Back to my data list",
    "datasheet.remove": "Delete datasheet",
    "datasheet.being_removed": ({ datasheetName }) => `Datasheet ${datasheetName} being removed ...`,
    "file_validation.required_error": "No files have been chosen",
    "file_validation.size_error": "File size cannot exceed 2 MB",
    "file_validation.format_error": "Format required for file is jpeg or png",
    "button.title": "Add, modify or remove thumbnail",
    "thumbnail_modal.title": "Datasheet thumbnail",
    "thumbnail_modal.file_hint": "Max size : 2 Mo. Accepted formats : jpg, png",
    "thumbnail_modal.action_being": ({ action }) => {
        switch (action) {
            case "add":
                return "Thumbnail being added ...";
            case "modify":
                return "Thumbnail being replaced ...";
            case "delete":
                return "Thumbnail being deleted ...";
        }
    },
    thumbnail_action: ({ action }) => {
        switch (action) {
            case "add":
                return "Add thumbnail";
            case "modify":
                return "Replace thumbnail";
            case "delete":
                return "Delete thumbnail";
        }
    },
    "thumbnail_confirm_delete_modal.title": "Are you sure you want to remove the thumbnail from this data sheet",
    "datasheet_confirm_delete_modal.title": ({ datasheetName }) => `Are you sure you want to delete datasheet ${datasheetName} ?`,
    "datasheet_confirm_delete_modal.text": "The following items will be deleted :",
    "metadata_tab.metadata.absent": undefined,
    "metadata_tab.metadata.is_loading": undefined,
    "services_tab.no_service": undefined,
    "documents_tab.documents_list.is_loading": undefined,
    "documents_tab.add_document": undefined,
    "documents_tab.add_document.type.label": undefined,
    "documents_tab.add_document.type.options.label": undefined,
    "documents_tab.add_document.in_progress": undefined,
    "documents_tab.add_document.error.name_required": undefined,
    "documents_tab.add_document.error.extention_incorrect": undefined,
    "documents_tab.add_document.error.extension_missing": undefined,
    "documents_tab.add_document.error.file_required": undefined,
    "documents_tab.add_document.error.file_too_large": undefined,
    "documents_tab.add_document.error.url_required": undefined,
    "documents_tab.add_document.error.url_invalid": undefined,
    "documents_tab.add_document.name.label": undefined,
    "documents_tab.add_document.description.label": undefined,
    "documents_tab.add_document.file.label": undefined,
    "documents_tab.add_document.file.hint": undefined,
    "documents_tab.add_document.link.label": undefined,
    "documents_tab.delete_document.confirmation": undefined,
    "documents_tab.delete_document.in_progress": undefined,
    "documents_tab.list.no_documents": undefined,
    "documents_tab.list.document_type": undefined,
    "documents_tab.edit_document": undefined,
    "documents_tab.edit_document.in_progress": undefined,
};

import { declareComponentKeys } from "i18nifty";

import { Translations } from "../../../i18n/types";

const { i18n } = declareComponentKeys<
    | "create_alert"
    | "edit_alert"
    | "save"
    | "table_caption"
    | "title"
    | "preview"
    | "newWindow"
    | "actions"
    | "update"
    | "delete"
    | "alert.severity"
    | "alert.title"
    | "alert.description"
    | "alert.linkUrl"
    | "alert.linkLabel"
    | "alert.date"
    | "alert.details"
    | "alert.homepage"
    | "alert.contact"
    | "alert.map"
    | "alert.serviceLevel"
    | "modal.cancel"
    | "modal.add"
    | "modal.edit"
>()("ConfigAlerts");
export type I18n = typeof i18n;

export const AlertsFrTranslations: Translations<"fr">["ConfigAlerts"] = {
    create_alert: "Créer une alerte",
    edit_alert: "Modifier une alerte",
    save: "Enregistrer",
    table_caption: "Alertes",
    title: "configuration : Alerte",
    preview: "Prévisualisation",
    newWindow: "nouvelle fenêtre",
    actions: "Actions",
    update: "Modifier",
    delete: "Supprimer",
    "alert.title": "Titre",
    "alert.description": "Description",
    "alert.linkUrl": "URL du lien",
    "alert.linkLabel": "Label du lien",
    "alert.severity": "Sévérité",
    "alert.date": "Date",
    "alert.details": "Détails",
    "alert.homepage": "Visible sur la page d'accueil",
    "alert.contact": "Visible sur la page de contact",
    "alert.map": "Visible sur la carte",
    "alert.serviceLevel": "Visible sur la page niveau de service",
    "modal.cancel": "Annuler",
    "modal.add": "Ajouter",
    "modal.edit": "Modifier",
};

export const AlertsEnTranslations: Translations<"en">["ConfigAlerts"] = {
    create_alert: undefined,
    edit_alert: undefined,
    save: undefined,
    table_caption: undefined,
    title: undefined,
    preview: undefined,
    newWindow: undefined,
    actions: undefined,
    update: undefined,
    delete: undefined,
    "alert.title": undefined,
    "alert.description": undefined,
    "alert.linkUrl": undefined,
    "alert.linkLabel": undefined,
    "alert.severity": undefined,
    "alert.date": undefined,
    "alert.details": undefined,
    "alert.homepage": undefined,
    "alert.contact": undefined,
    "alert.map": undefined,
    "alert.serviceLevel": undefined,
    "modal.cancel": undefined,
    "modal.add": undefined,
    "modal.edit": undefined,
};

import { declareComponentKeys } from "i18nifty";

import { Translations } from "../../../i18n/types";

const { i18n } = declareComponentKeys<
    | "create_alert"
    | "edit_alert"
    | "alerts_updated"
    | "alerts_update_error"
    | "alerts_unsaved"
    | "save"
    | "table_caption"
    | "no_alerts"
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
    | "alert.visible"
    | "alert.homepage"
    | "alert.contact"
    | "alert.map"
    | "alert.serviceLevel"
    | "modal.cancel"
    | "modal.add"
    | "modal.edit"
>()("alerts");
export type I18n = typeof i18n;

export const AlertsFrTranslations: Translations<"fr">["alerts"] = {
    create_alert: "Créer une alerte",
    edit_alert: "Modifier une alerte",
    alerts_updated: "Alertes mises à jour",
    alerts_update_error: "Erreur lors de la mise à jour des alertes",
    alerts_unsaved: "Vous avez des modifications non enregistrées",
    save: "Enregistrer",
    table_caption: "Alertes",
    no_alerts: "Aucune alerte disponible",
    title: "Configuration : Alertes",
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
    "alert.visible": "Visible sur",
    "alert.homepage": "la page d'accueil",
    "alert.contact": "la page de contact",
    "alert.map": "la carte",
    "alert.serviceLevel": "la page niveau de service",
    "modal.cancel": "Annuler",
    "modal.add": "Ajouter",
    "modal.edit": "Modifier",
};

export const AlertsEnTranslations: Translations<"en">["alerts"] = {
    create_alert: undefined,
    edit_alert: undefined,
    alerts_updated: undefined,
    alerts_update_error: undefined,
    alerts_unsaved: undefined,
    save: undefined,
    table_caption: undefined,
    no_alerts: undefined,
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
    "alert.visible": undefined,
    "alert.homepage": undefined,
    "alert.contact": undefined,
    "alert.map": undefined,
    "alert.serviceLevel": undefined,
    "modal.cancel": undefined,
    "modal.add": undefined,
    "modal.edit": undefined,
};

import { declareComponentKeys } from "i18nifty";

import { Translations } from "../../../i18n/types";

const { i18n } = declareComponentKeys<
    | "create_alert"
    | "enregistrer"
    | "table_caption"
    | "title"
    | "th.severity"
    | "th.title"
    | "th.date"
    | "th.homepage"
    | "th.contact"
    | "th.map"
    | "th.serviceLevel"
>()("ConfigAlerts");
export type I18n = typeof i18n;

export const AlertsFrTranslations: Translations<"fr">["ConfigAlerts"] = {
    create_alert: "Créer une alerte",
    enregistrer: "Enregistrer",
    table_caption: "Alertes",
    title: "configuration : Alerte",
    "th.severity": "Sévérité",
    "th.title": "Titre",
    "th.date": "Date",
    "th.homepage": "Visible sur la page d'accueil",
    "th.contact": "Visible sur la page de contact",
    "th.map": "Visible sur la carte",
    "th.serviceLevel": "Visible sur la page niveau de service",
};

export const AlertsEnTranslations: Translations<"en">["ConfigAlerts"] = {
    create_alert: undefined,
    enregistrer: undefined,
    table_caption: undefined,
    title: undefined,
    "th.severity": undefined,
    "th.title": undefined,
    "th.date": undefined,
    "th.homepage": undefined,
    "th.contact": undefined,
    "th.map": undefined,
    "th.serviceLevel": undefined,
};

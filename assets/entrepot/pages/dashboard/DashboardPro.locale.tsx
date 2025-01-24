import { declareComponentKeys } from "i18nifty";

import { Translations } from "../../../i18n/types";

const { i18n } = declareComponentKeys<
    "document_title" | "espaceco_frontoffice_list" | "datastore_for_tests" | "datastore_creation_form" | "join_existing_community" | "configuration" | "alerts"
>()("DashboardPro");
export type I18n = typeof i18n;

export const DashboardProFrTranslations: Translations<"fr">["DashboardPro"] = {
    document_title: "Tableau de bord professionnel",
    espaceco_frontoffice_list: "Liste des guichets de l’espace collaboratif",
    datastore_for_tests: "À des fins de test",
    datastore_creation_form: "Demande de création d’un espace de travail",
    join_existing_community: "Rejoindre un espace de travail existant",
    configuration: "Configuration",
    alerts: "Alertes",
};

export const DashboardProEnTranslations: Translations<"en">["DashboardPro"] = {
    document_title: "Professional dashboard",
    espaceco_frontoffice_list: "List of collaborative space front offices",
    datastore_for_tests: "For testing purposes",
    datastore_creation_form: undefined,
    join_existing_community: undefined,
    configuration: undefined,
    alerts: undefined,
};

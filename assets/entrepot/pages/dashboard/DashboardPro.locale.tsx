import { declareComponentKeys } from "i18nifty";

import { Translations } from "../../../i18n/types";

const { i18n } = declareComponentKeys<"document_title" | "espaceco_frontoffice_list" | "datastore_for_tests">()("DashboardPro");
export type I18n = typeof i18n;

export const DashboardProFrTranslations: Translations<"fr">["DashboardPro"] = {
    document_title: "Tableau de bord professionnel",
    espaceco_frontoffice_list: "Liste des guichets de l’espace collaboratif",
    datastore_for_tests: "À des fins de test",
};

export const DashboardProEnTranslations: Translations<"en">["DashboardPro"] = {
    document_title: "Professional dashboard",
    espaceco_frontoffice_list: "List of collaborative space front offices",
    datastore_for_tests: "For testing purposes",
};

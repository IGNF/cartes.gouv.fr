import { declareComponentKeys } from "i18nifty";

import { Translations } from "@/i18n/types";
import { StatsScope } from "./statsConfig";
import { StatsType } from "@/@types/stats";

const { i18n } = declareComponentKeys<
    | "scope_selection_title"
    | { K: "scope_title"; P: { scope: StatsScope }; R: string }
    | { K: "data_type"; P: { type: StatsType }; R: string }
    | "view_chart"
    | "view_table"
    | "export_chart"
    | "export_data"
    | "date_column"
    | "view_mode_legend"
    | "error_loading"
>()("Stats");
export type I18n = typeof i18n;

export const StatsFrTranslations: Translations<"fr">["Stats"] = {
    scope_selection_title: "Statistiques",
    scope_title: ({ scope }) => {
        switch (scope) {
            case "datastore":
                return "Statistiques de l’entrepôt";
            case "community":
                return "Statistiques de la communauté";
            case "user":
                return "Mes statistiques";
            default:
                return scope;
        }
    },
    data_type: ({ type }) => {
        switch (type) {
            case StatsType.DATA_TRANSFER:
                return "Volume de données transférées";
            case StatsType.HITS:
                return "Nombre d’appels";
            default:
                return type;
        }
    },
    view_chart: "Graphique",
    view_table: "Tableau",
    export_chart: "Exporter le graphique",
    export_data: "Exporter les données",
    date_column: "Date",
    view_mode_legend: "Mode d’affichage",
    error_loading: "Erreur lors du chargement des statistiques",
};
export const StatsEnTranslations: Translations<"en">["Stats"] = {
    scope_selection_title: undefined,
    scope_title: undefined,
    data_type: undefined,
    view_chart: undefined,
    view_table: undefined,
    export_chart: undefined,
    export_data: undefined,
    date_column: undefined,
    view_mode_legend: undefined,
    error_loading: undefined,
};

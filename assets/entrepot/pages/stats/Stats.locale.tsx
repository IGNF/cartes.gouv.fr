import { declareComponentKeys } from "i18nifty";
import { ReactNode } from "react";

import { StatsType } from "@/@types/stats";
import { Translations } from "@/i18n/types";
import { routes } from "@/router/router";
import type { StatsScope } from "./stats.types";

const { i18n } = declareComponentKeys<
    | "scope_selection_title"
    | { K: "scope_title"; P: { scope: StatsScope }; R: string }
    | { K: "scope_desc"; P: { scope: StatsScope }; R: string }
    | { K: "entity_select_label"; P: { scope: StatsScope }; R: string }
    | "entity_datastore_service"
    | "entity_datastore_permission"
    | "entity_user_me"
    | "entity_user_permission"
    | "entity_user_key"
    | "param_datastore_label"
    | "param_service_label"
    | "param_permission_label"
    | "param_key_label"
    | { K: "service_group_label"; P: { type: string; open: boolean }; R: string }
    | { K: "service_aggregate_label"; P: { type: string; open: boolean }; R: string }
    | "service_select_no_match"
    | { K: "no_datastore_message"; R: ReactNode }
    | "datastore_intro"
    | "options_loading"
    | "no_options"
    | "no_data"
    | "no_data_found"
    | "no_stats_for_scope"
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
    scope_selection_title: "Statistiques de consommation",
    scope_title: ({ scope }) => {
        switch (scope) {
            case "datastore":
                return "Mes entrepôts";
            case "user":
                return "Utilisateur (moi)";
            default:
                return scope;
        }
    },
    scope_desc: ({ scope }) => {
        switch (scope) {
            case "datastore":
                return "Statistiques de consommation de mes entrepôts";
            case "user":
                return "Mes statistiques personnelles de consommation";
            default:
                return scope;
        }
    },
    entity_select_label: ({ scope }) => (scope === "datastore" ? "Suivre les…" : "Suivre mes…"),
    entity_datastore_service: "Services",
    entity_datastore_permission: "Permissions",
    entity_user_me: "consommations globales",
    entity_user_permission: "consommations par permission",
    entity_user_key: "consommations par clé d'accès",
    param_datastore_label: "Entrepôt",
    param_service_label: "Service",
    param_permission_label: "Permission",
    param_key_label: "Clé",
    service_group_label: ({ type, open }) => `${type} ${open ? "public" : "privé"}`,
    service_aggregate_label: ({ type, open }) => `Tous les ${type} ${open ? "publics" : "privés"}`,
    service_select_no_match: "Aucun service ne correspond à votre recherche",
    no_datastore_message: (
        <>
            {"Vous ne faites partie d'aucun entrepôt. Consultez "}
            <a {...routes.stats_by_scope({ scope: "user" }).link}>vos statistiques personnelles</a>.
        </>
    ),
    datastore_intro: "Sélectionnez un de vos entrepôts pour accéder à des statistiques de consommation détaillées.",
    options_loading: "Chargement…",
    no_options: "Aucune option",
    no_data: "Pas de données",
    no_data_found: "Aucune donnée trouvée",
    no_stats_for_scope: "Aucune statistique disponible pour ce périmètre.",
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
    scope_desc: undefined,
    entity_select_label: undefined,
    entity_datastore_service: undefined,
    entity_datastore_permission: undefined,
    entity_user_me: undefined,
    entity_user_permission: undefined,
    entity_user_key: undefined,
    param_datastore_label: undefined,
    param_service_label: undefined,
    param_permission_label: undefined,
    param_key_label: undefined,
    service_group_label: undefined,
    service_aggregate_label: undefined,
    service_select_no_match: undefined,
    no_datastore_message: undefined,
    datastore_intro: undefined,
    options_loading: undefined,
    no_options: undefined,
    no_data: undefined,
    no_data_found: undefined,
    no_stats_for_scope: undefined,
    data_type: undefined,
    view_chart: undefined,
    view_table: undefined,
    export_chart: undefined,
    export_data: undefined,
    date_column: undefined,
    view_mode_legend: undefined,
    error_loading: undefined,
};

import { declareComponentKeys } from "i18nifty";
import { ReactNode } from "react";

import { formatDateFromISO } from "@/utils";
import { Translations } from "../../../../i18n/types";
import { FilterEnum, SortByEnum, SortOrderEnum } from "./DatasheetList.types";

const { i18n } = declareComponentKeys<
    | { K: "title"; P: { datastoreName?: string }; R: string }
    | "create_datasheet"
    | "datasheet_creation_impossible"
    | "metadata_endpoint_quota_reached"
    | { K: "services_published"; P: { nbServices?: number }; R: string }
    | "no_services_published"
    | { K: "sandbox_datastore_explanation"; R: ReactNode }
    | "refresh_datasheet_list"
    | { K: "last_refresh_date"; P: { dataUpdatedAt: number }; R: string }
    | { K: "nb_results"; P: { nb: number }; R: string }
    | "filter_label"
    | { K: "filter_option"; P: { filter: FilterEnum }; R: string }
    | "sort_label"
    | "sort_placeholder"
    | { K: "sort_option"; P: { sort: SortByEnum; sortOrder: SortOrderEnum }; R: string }
    | "view"
>()("DatasheetList");
export type I18n = typeof i18n;

export const DatasheetListFrTranslations: Translations<"fr">["DatasheetList"] = {
    title: ({ datastoreName }) => `Données ${datastoreName ?? ""}`,
    create_datasheet: "Créer une fiche de données",
    datasheet_creation_impossible: "Création d’une nouvelle fiche de données impossible",
    metadata_endpoint_quota_reached: "Quota du point d’accès de métadonnées atteint",
    services_published: ({ nbServices }) => `Publié (${nbServices})`,
    no_services_published: "Non publié",
    sandbox_datastore_explanation:
        "Cet espace permet de tester les fonctions d’alimentation et de diffusion de la Géoplateforme. Les services publiés dans cet espace ne sont pas visibles sur le catalogue.",
    refresh_datasheet_list: "Rafraîchir",
    last_refresh_date: ({ dataUpdatedAt }) => `Données mises à jour le ${formatDateFromISO(new Date(dataUpdatedAt).toISOString())}`,
    nb_results: ({ nb }) => `${nb} résultats`,
    filter_label: "Filtrer",
    filter_option: ({ filter }) => {
        switch (filter) {
            case FilterEnum.ALL:
                return "Toutes les fiches";
            case FilterEnum.PUBLISHED:
                return "Fiches publiées";
            case FilterEnum.NOT_PUBLISHED:
                return "Fiches non publiées";
            default:
                return "Filtre inconnu";
        }
    },
    sort_label: "Trier",
    sort_placeholder: "Trier par",
    sort_option: ({ sort, sortOrder }) => {
        switch (sort) {
            case SortByEnum.NAME:
                return `Nom : ${sortOrder === SortOrderEnum.ASCENDING ? "de A à Z" : "de Z à A"}`;
            case SortByEnum.NB_SERVICES:
                return `Nombre de services publiés : ${sortOrder === SortOrderEnum.ASCENDING ? "croissant" : "décroissant"}`;
            default:
                return "Tri inconnu";
        }
    },
    view: "Consulter",
};

export const DatasheetListEnTranslations: Translations<"en">["DatasheetList"] = {
    title: undefined,
    create_datasheet: undefined,
    datasheet_creation_impossible: undefined,
    metadata_endpoint_quota_reached: undefined,
    services_published: undefined,
    no_services_published: undefined,
    sandbox_datastore_explanation: undefined,
    refresh_datasheet_list: undefined,
    last_refresh_date: undefined,
    nb_results: undefined,
    filter_label: undefined,
    filter_option: undefined,
    sort_label: undefined,
    sort_placeholder: undefined,
    sort_option: undefined,
    view: undefined,
};

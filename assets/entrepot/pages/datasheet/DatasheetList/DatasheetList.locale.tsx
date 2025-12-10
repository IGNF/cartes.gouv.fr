import { fr } from "@codegouvfr/react-dsfr";
import { declareComponentKeys } from "i18nifty";
import { ReactNode } from "react";

import { FilterEnum } from "@/hooks/useFilters";
import { SortOrderEnum } from "@/hooks/useSort";
import { externalLink } from "@/router/externalUrls";
import { Translations } from "../../../../i18n/types";
import { SortByEnum } from "./DatasheetList.types";

const { i18n } = declareComponentKeys<
    | { K: "title"; P: { datastoreName?: string }; R: string | undefined }
    | "create_datasheet"
    | "datasheet_creation_impossible"
    | "metadata_endpoint_quota_reached"
    | { K: "services_published"; P: { nbServices?: number }; R: string }
    | "no_services_published"
    | "sandbox_datastore_explanation_title"
    | { K: "sandbox_datastore_explanation_desc"; R: ReactNode }
    | "filter_label"
    | "filter_placeholder"
    | { K: "filter_option"; P: { filter: FilterEnum }; R: string }
    | "sort_label"
    | "sort_placeholder"
    | { K: "sort_option"; P: { sort: SortByEnum; sortOrder: SortOrderEnum }; R: string }
    | "view"
>()("DatasheetList");
export type I18n = typeof i18n;

export const DatasheetListFrTranslations: Translations<"fr">["DatasheetList"] = {
    title: ({ datastoreName }) => datastoreName,
    create_datasheet: "Créer une fiche de données",
    datasheet_creation_impossible: "Création d’une nouvelle fiche de données impossible",
    metadata_endpoint_quota_reached: "Quota du point d’accès de métadonnées atteint",
    services_published: ({ nbServices }) => `Publié (${nbServices})`,
    no_services_published: "Non publié",
    sandbox_datastore_explanation_title: "Tester vos données avant de les publier !",
    sandbox_datastore_explanation_desc: (
        <>
            Lorsque vous publiez vos données, celles-ci apparaissent automatiquement dans les services de visualisation{" "}
            <a {...externalLink("maps")} className={fr.cx("fr-link")}>
                Explorer les cartes
            </a>{" "}
            et de catalogue{" "}
            <a {...externalLink("catalogue")} className={fr.cx("fr-link")}>
                Rechercher une donnée
            </a>
            .
            <br />
            Cet espace, ouvert à tous les utilisateurs, vous permet de tester les fonctionnalités de diffusion sans publier réellement vos données.
        </>
    ),
    filter_label: "Filtrer par",
    filter_placeholder: "Filtrer par",
    filter_option: ({ filter }) => {
        switch (filter) {
            case FilterEnum.ALL:
                return "Toutes les fiches";
            case FilterEnum.ENABLED:
                return "Fiches publiées";
            case FilterEnum.DISABLED:
                return "Fiches non publiées";
            default:
                return "Filtre inconnu";
        }
    },
    sort_label: "Trier par",
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
    sandbox_datastore_explanation_title: undefined,
    sandbox_datastore_explanation_desc: undefined,
    filter_label: undefined,
    filter_placeholder: undefined,
    filter_option: undefined,
    sort_label: undefined,
    sort_placeholder: undefined,
    sort_option: undefined,
    view: undefined,
};

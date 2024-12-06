import { declareComponentKeys } from "i18nifty";
import { ReactNode } from "react";
import { Translations } from "../../../../i18n/types";

const { i18n } = declareComponentKeys<
    | { K: "title"; P: { datastoreName?: string }; R: string }
    | "create_datasheet"
    | "datasheet_creation_impossible"
    | "metadata_endpoint_quota_reached"
    | { K: "services_published"; P: { nbServices?: number }; R: string }
    | "no_services_published"
    | { K: "sandbox_datastore_explanation"; R: ReactNode }
>()("DatasheetList");
export type I18n = typeof i18n;

export const DatasheetListFrTranslations: Translations<"fr">["DatasheetList"] = {
    title: ({ datastoreName }) => `Données ${datastoreName ?? ""}`,
    create_datasheet: "Créer une fiche de données",
    datasheet_creation_impossible: "Création d’une nouvelle fiche de données impossible",
    metadata_endpoint_quota_reached: "Quota du point d’accès de métadonnées atteint",
    services_published: ({ nbServices }) => `Publié (${nbServices})`,
    no_services_published: "Non publié",
    sandbox_datastore_explanation: (
        <p>
            {
                "Cet espace permet de tester les fonctions d’alimentation et de diffusion de la Géoplateforme. Les services publiés dans cet espace ne sont pas visibles sur le catalogue."
            }
        </p>
    ),
};

export const DatasheetListEnTranslations: Translations<"en">["DatasheetList"] = {
    title: undefined,
    create_datasheet: undefined,
    datasheet_creation_impossible: undefined,
    metadata_endpoint_quota_reached: undefined,
    services_published: undefined,
    no_services_published: undefined,
    sandbox_datastore_explanation: undefined,
};

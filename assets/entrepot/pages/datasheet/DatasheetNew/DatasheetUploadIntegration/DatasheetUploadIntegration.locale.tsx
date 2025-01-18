import { declareComponentKeys } from "i18nifty";
import { Translations } from "../../../../../i18n/types";

const { i18n } = declareComponentKeys<
    | { K: "step_title"; P: { step_name: string }; R: string }
    | { K: "step_status_text"; P: { step_status: string }; R: string }
    | "data_integration_in_progress"
    | "long_operation_information"
    | "continue_browsing_data_not_ready"
    | "view_datasheet"
    | "check_error_report"
    | "back_to_datasheet_list"
    | "integration_page.title"
>()("DatasheetUploadIntegration");
export type I18n = typeof i18n;

export const DatasheetUploadIntegrationFrTranslations: Translations<"fr">["DatasheetUploadIntegration"] = {
    step_title: ({ step_name }) => {
        switch (step_name) {
            case "send_files_api":
                return "Chargement des fichiers";
            case "wait_checks":
                return "Vérifications standard et vecteur";
            case "integration_processing":
                return "Intégration en base de données";
            default:
                return "Étape inconnue";
        }
    },
    step_status_text: ({ step_status }) => {
        switch (step_status) {
            case "in_progress":
                return "En cours";
            case "successful":
                return "Succès";
            case "failed":
                return "Echec";
            case "waiting":
                return "En attente";
            default:
                return "Statut inconnu";
        }
    },
    data_integration_in_progress: "Vos données vecteur sont en cours de dépôt",
    long_operation_information: "Les opérations suivantes peuvent prendre quelques minutes. Merci pour votre patience.",
    continue_browsing_data_not_ready: "Vous pouvez maintenant poursuivre votre navigation même si vos données ne sont pas encore prêtes.",
    view_datasheet: "Consulter la fiche de données",
    check_error_report: "Voir le rapport d’erreur",
    back_to_datasheet_list: "Revenir à mes données",

    "integration_page.title": "Intégration des données",
};

export const DatasheetUploadIntegrationEnTranslations: Translations<"en">["DatasheetUploadIntegration"] = {
    step_title: undefined,
    step_status_text: undefined,
    data_integration_in_progress: undefined,
    long_operation_information: undefined,
    continue_browsing_data_not_ready: undefined,
    view_datasheet: undefined,
    check_error_report: undefined,
    back_to_datasheet_list: undefined,

    "integration_page.title": undefined,
};

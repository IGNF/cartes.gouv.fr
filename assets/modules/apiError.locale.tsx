import { declareComponentKeys } from "../i18n/i18n";
import { Translations } from "../i18n/types";

const { i18n } = declareComponentKeys<
    "bad_request" | "unauthorized" | "forbidden" | "not_found" | "conflict" | "unprocessable" | "unavailable" | "server_error" | "default"
>()("ApiError");
export type I18n = typeof i18n;

export const ApiErrorFrTranslations: Translations<"fr">["ApiError"] = {
    bad_request: "La requête est invalide",
    unauthorized: "Vous devez être connecté",
    forbidden: "Vous n’avez pas les droits nécessaires",
    not_found: "La ressource demandée est introuvable",
    conflict: "L’opération n’est pas possible dans l’état actuel",
    unprocessable: "Les données envoyées sont invalides",
    unavailable: "Le service est momentanément indisponible, veuillez réessayer",
    server_error: "Une erreur interne s’est produite",
    default: "Une erreur s’est produite",
};

export const ApiErrorEnTranslations: Translations<"en">["ApiError"] = {
    bad_request: "The request is invalid",
    unauthorized: "You must be logged in",
    forbidden: "You do not have the required permissions",
    not_found: "The requested resource was not found",
    conflict: "The operation is not possible in the current state",
    unprocessable: "The submitted data is invalid",
    unavailable: "The service is temporarily unavailable, please try again",
    server_error: "An internal error occurred",
    default: "An error occurred",
};

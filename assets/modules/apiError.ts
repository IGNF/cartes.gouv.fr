import { getTranslation } from "../i18n/i18n";
import { ApiError } from "./jsonFetch";

type ApiErrorTitleKey = "bad_request" | "unauthorized" | "forbidden" | "not_found" | "conflict" | "unprocessable" | "unavailable" | "server_error" | "default";

const titleKeyByStatus: Record<number, ApiErrorTitleKey> = {
    400: "bad_request",
    401: "unauthorized",
    403: "forbidden",
    404: "not_found",
    409: "conflict",
    422: "unprocessable",
    502: "unavailable",
    503: "unavailable",
    504: "unavailable",
};

/** titre traduit selon le statut, quand l'appelant n'a pas de titre propre à son contexte */
export function getApiErrorTitle(error: ApiError | null | undefined): string {
    const { t } = getTranslation("ApiError");
    const status = error?.status ?? 0;
    return t(titleKeyByStatus[status] ?? (status >= 500 ? "server_error" : "default"));
}

/** texte de l'erreur (texte amont affiché tel quel), absent s'il ne fait que répéter le libellé HTTP du statut */
export function getApiErrorDescription(error: ApiError | null | undefined): string | undefined {
    if (!error?.detail || error.detail === error.title) {
        return undefined;
    }
    return error.detail;
}

/** texte unique à afficher sous un titre propre au contexte : le texte de l'erreur, sinon le titre traduit selon le statut */
export function getApiErrorMessage(error: ApiError | null | undefined): string {
    return getApiErrorDescription(error) ?? getApiErrorTitle(error);
}

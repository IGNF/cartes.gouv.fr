import { useAuthStore } from "../stores/AuthStore";
import { resetAuth } from "./authReset";

/** doit avoir la même structure que l'erreur renvoyée par CartesApiExceptionSubscriber de Symfony */
export type CartesApiException = {
    code: number;
    status: string;
    message: string;
    details: unknown;
};

export const isCartesApiException = (error: unknown): error is CartesApiException => {
    if (!error || typeof error !== "object") return false;
    const maybe = error as Partial<CartesApiException>;
    return typeof maybe.code === "number" && typeof maybe.status === "string";
};

export async function apiFetch(
    url: RequestInfo | URL,
    config: Omit<RequestInit, "body"> = {},
    body: FormData | object | null = null,
    isFileUpload: boolean = false,
    isXMLHttpRequest: boolean = true
): Promise<Response> {
    return new Promise((resolve, reject) => {
        (async function () {
            const defaultHeaders: HeadersInit = {};

            const fetchConfig: RequestInit = { ...config };

            if (isFileUpload) {
                // ne rien changer au FormData si c'est un envoi de fichier
                fetchConfig.body = body as FormData;
            } else {
                // convertir en chaîne JSON
                fetchConfig.body = body && typeof body === "object" ? JSON.stringify(body) : body;
            }

            // ajouter le header XMLHttpRequest si nécessaire/demandé
            if (isXMLHttpRequest) {
                defaultHeaders["X-Requested-With"] = "XMLHttpRequest";
            }

            fetchConfig.headers = {
                ...defaultHeaders,
                ...config.headers,
            };

            const request = new Request(url, fetchConfig);

            try {
                const response = await fetch(request);

                if (response.ok) {
                    useAuthStore.getState().setSessionExpired(false);
                    resolve(response);
                } else {
                    const data = (await response.json().catch(() => ({}))) as Partial<CartesApiException>;
                    const error: CartesApiException = {
                        code: typeof data.code === "number" ? data.code : response.status,
                        status: typeof data.status === "string" ? data.status : response.statusText,
                        message: typeof data.message === "string" ? data.message : "Request failed",
                        details: data.details ?? null,
                    };

                    if (hasSessionExpired(error)) {
                        if (!useAuthStore.getState().logoutInProgress) {
                            resetAuth("session-expired");
                        }
                    }
                    reject(error);
                }
            } catch (error) {
                if (error instanceof DOMException && (error?.name === "AbortError" || error?.name === "NetworkError")) {
                    // NOTE : ne rien faire, requête annulée par react-query parce que requête en doublon (en mode strict de react)
                } else {
                    reject(error);
                }
            }
        })();
    });
}

export async function jsonFetch<T>(
    url: RequestInfo | URL,
    config: Omit<RequestInit, "body"> = {},
    body: FormData | object | null = null,
    isFileUpload: boolean = false,
    isXMLHttpRequest: boolean = true
): Promise<T> {
    return (await apiFetch(url, config, body, isFileUpload, isXMLHttpRequest)).json().catch(() => ({}));
}

const hasSessionExpired = (error) => {
    if (!error || typeof error !== "object") return false;
    const err = error as CartesApiException;

    if (err.code !== 401) return false;
    if (!err.details || typeof err.details !== "object") return false;

    const details = err.details as Record<string, unknown>;
    return details.controller === "App\\Controller\\ApiControllerInterface" && details.session_expired === true;
};

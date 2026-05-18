import { attemptSilentReauth } from "./silentReauth";

/** doit avoir la même structure que l'erreur renvoyée par CartesApiExceptionSubscriber de Symfony */
export type CartesApiException = {
    code: number;
    status: string;
    message: string;
    details?: unknown;
};

export async function apiFetch(
    url: RequestInfo | URL,
    config: Omit<RequestInit, "body"> = {},
    body: FormData | object | null = null,
    isFileUpload: boolean = false,
    isXMLHttpRequest: boolean = true,
    _retried: boolean = false
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
                    resolve(response);
                } else {
                    const data = await response.json().catch(() => ({}));
                    if (!_retried && hasSessionExpired(data)) {
                        const renewed = await attemptSilentReauth();
                        if (renewed) {
                            apiFetch(url, config, body, isFileUpload, isXMLHttpRequest, true).then(resolve, reject);
                        } else {
                            window.location.assign("/login?session_expired=1");
                        }
                        return;
                    }
                    reject(data);
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
    return error.code === 401 && error?.details?.controller === "App\\Controller\\ApiControllerInterface" && error?.details?.session_expired === true;
};

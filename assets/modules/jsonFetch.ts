import { useAuthStore } from "../stores/AuthStore";

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
    isXMLHttpRequest: boolean = true
): Promise<Response> {
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

    // NOTE : les erreurs réseau et les annulations (AbortError) sont propagées telles quelles, react-query les gère
    const response = await fetch(new Request(url, fetchConfig));

    if (response.ok) {
        useAuthStore.getState().setSessionExpired(false);
        return response;
    }

    // corps non-JSON (page d'erreur proxy...) : erreur normalisée à partir du status HTTP
    const data: Partial<CartesApiException> | null = await response.json().catch(() => null);

    if (data !== null && hasSessionExpired(data)) {
        useAuthStore.getState().setSessionExpired(true);
    }

    const apiException: CartesApiException = {
        ...data,
        code: typeof data?.code === "number" ? data.code : response.status,
        status: typeof data?.status === "string" ? data.status : response.statusText,
        message: typeof data?.message === "string" ? data.message : `${response.status} ${response.statusText}`,
    };
    throw apiException;
}

export async function jsonFetch<T>(
    url: RequestInfo | URL,
    config: Omit<RequestInit, "body"> = {},
    body: FormData | object | null = null,
    isFileUpload: boolean = false,
    isXMLHttpRequest: boolean = true
): Promise<T> {
    const response = await apiFetch(url, config, body, isFileUpload, isXMLHttpRequest);
    return response.json().catch(() => ({}));
}

const hasSessionExpired = (error: Partial<CartesApiException>) => {
    const details = error?.details as { controller?: string; session_expired?: boolean } | undefined;
    return error.code === 401 && details?.controller === "App\\Controller\\ApiControllerInterface" && details?.session_expired === true;
};

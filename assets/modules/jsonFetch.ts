import { useAuthStore } from "../stores/AuthStore";

/** corps d'erreur de l'API interne (Problem Details, RFC 9457) */
export type ApiError = {
    status: number;
    title: string;
    detail?: string;
    type?: string;
    details?: unknown;
    violations?: { propertyPath: string; title: string; template?: string; parameters?: Record<string, string>; type?: string }[];
};

/** valeurs de `type` sur lesquelles le front branche (App\Exception\ApiErrorType côté Symfony) */
export const ApiErrorType = {
    SESSION_EXPIRED: "/errors/session-expired",
    ANONYMOUS: "/errors/anonymous",
} as const;

export async function apiFetch(
    url: RequestInfo | URL,
    config: Omit<RequestInit, "body"> = {},
    body: FormData | object | null = null,
    isFileUpload: boolean = false,
    isXMLHttpRequest: boolean = true
): Promise<Response> {
    const defaultHeaders: HeadersInit = { Accept: "application/json" };

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
    const data: Partial<ApiError> | null = await response.json().catch(() => null);

    if (response.status === 401 && data?.type === ApiErrorType.SESSION_EXPIRED) {
        useAuthStore.getState().setSessionExpired(true);
    }

    const apiError: ApiError = {
        ...data,
        status: typeof data?.status === "number" ? data.status : response.status,
        title: typeof data?.title === "string" ? data.title : response.statusText,
    };
    throw apiError;
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

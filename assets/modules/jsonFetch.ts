export class JsonFetchError {
    data?: unknown;
    status: number;

    constructor(status: number, data: unknown) {
        this.data = data;
        this.status = status;
    }
}

/**
 * @throws {JsonFetchError} error
 */
export async function jsonFetch<T>(
    url: RequestInfo | URL,
    config: Omit<RequestInit, "body"> = {},
    body: FormData | object | null = null,
    isFileUpload: boolean = false,
    isXMLHttpRequest: boolean = true
): Promise<T> {
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
    const response = await fetch(request);

    // may error if there is no body, return empty array
    const data = await response.json().catch(() => ({}));

    if (response.ok) {
        return data;
    } else {
        throw new JsonFetchError(response.status, data);
    }
}

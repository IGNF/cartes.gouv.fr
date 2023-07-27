/** doit avoir la même structure que l'erreur renvoyée par CartesApiExceptionSubscriber de Symfony */
export type CartesApiException = {
    code: number;
    status: string;
    message: string;
    details: unknown[];
};

export async function jsonFetch<T>(
    url: RequestInfo | URL,
    config: Omit<RequestInit, "body"> = {},
    body: FormData | object | null = null,
    isFileUpload: boolean = false,
    isXMLHttpRequest: boolean = true
): Promise<T> {
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
            const response = await fetch(request);

            // retourner un objet vide si la réponse n'a pas de body (dans un cas de 204 par exemple)
            const data = await response.json().catch(() => ({}));

            if (response.ok) {
                resolve(data);
            } else {
                reject(data);
            }
        })();
    });
}

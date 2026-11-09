import { hashKey, MutationCache, QueryCache, QueryClient, type QueryKey } from "@tanstack/react-query";

import { delta } from "@/utils/delta";
import RQKeys from "./entrepot/RQKeys";
import { ApiError } from "./jsonFetch";

// erreur par défaut des requêtes : corps d'erreur de l'API (jsonFetch) ou erreur JavaScript (réseau, appel hors API)
declare module "@tanstack/react-query" {
    interface Register {
        defaultError: ApiError | Error;
    }
}

export const userMeHash = hashKey(RQKeys.user_me());
const USER_ME_REVALIDATION_WINDOW = delta.seconds(30);
let lastRevalidation = 0;

/** une revalidation de user_me au plus toutes les 30 s ; le routeur ré-évalue ses gates quand user_me change */
export function revalidateUser(): void {
    const now = Date.now();
    if (now - lastRevalidation < USER_ME_REVALIDATION_WINDOW) return;
    lastRevalidation = now;
    void queryClient.invalidateQueries({ queryKey: RQKeys.user_me(), exact: true });
}

// 403 ou 404 : les droits ont pu changer côté serveur ; le 401 relève de la session expirée (jsonFetch)
function revalidateUserOnAccessError(error: unknown, queryKey?: QueryKey): void {
    // statut lu sans isApiError : apiError charge l’i18n, qui exige un navigateur
    const status = (error as Partial<ApiError> | null)?.status;
    if (status !== 403 && status !== 404) return;
    if (queryKey !== undefined && hashKey(queryKey) === userMeHash) return;
    revalidateUser();
}

// une erreur 4xx ne change pas en réessayant : page d’erreur sans attendre
export function shouldRetry(failureCount: number, error: unknown): boolean {
    const status = (error as Partial<ApiError> | null)?.status;
    if (typeof status === "number" && status >= 400 && status < 500) return false;
    return failureCount < 3;
}

/**
 * L'instance de QueryClient utilisée dans toute l'application.
 */
export const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: shouldRetry } },
    queryCache: new QueryCache({ onError: (error, query) => revalidateUserOnAccessError(error, query.queryKey) }),
    mutationCache: new MutationCache({ onError: (error) => revalidateUserOnAccessError(error) }),
});

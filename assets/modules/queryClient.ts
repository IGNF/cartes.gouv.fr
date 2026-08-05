import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";

import RQKeys from "./entrepot/RQKeys";
import { CartesApiException } from "./jsonFetch";

// délai minimum entre deux invalidations de user_me déclenchées par des erreurs d'autorisation
const USER_ME_INVALIDATION_MIN_INTERVAL = 30_000;
let lastUserMeInvalidation = 0;

/**
 * Sur une erreur d'autorisation ou d'existence (401/403/404), les droits de l'utilisateur
 * ont pu changer côté serveur : on revalide user_me pour que les gates se ré-évaluent.
 */
function revalidateUserOnAuthError(error: unknown, queryKey?: readonly unknown[]): void {
    const code = (error as Partial<CartesApiException> | undefined)?.code;
    if (code !== 401 && code !== 403 && code !== 404) return;

    const userMeKey = RQKeys.user_me();
    // ne pas s'auto-invalider si c'est user_me qui a échoué
    if (queryKey !== undefined && queryKey.length === userMeKey.length && userMeKey.every((part, i) => queryKey[i] === part)) return;

    const now = Date.now();
    if (now - lastUserMeInvalidation < USER_ME_INVALIDATION_MIN_INTERVAL) return;
    lastUserMeInvalidation = now;

    queryClient.invalidateQueries({ queryKey: userMeKey });
}

/**
 * L'instance de QueryClient utilisée dans toute l'application.
 */
export const queryClient = new QueryClient({
    queryCache: new QueryCache({
        onError: (error, query) => revalidateUserOnAuthError(error, query.queryKey),
    }),
    mutationCache: new MutationCache({
        onError: (error) => revalidateUserOnAuthError(error),
    }),
});

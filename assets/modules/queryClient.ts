import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";

import { delta } from "@/utils/delta";
import RQKeys from "./entrepot/RQKeys";
import { CartesApiException } from "./jsonFetch";

/** fenêtre pendant laquelle user_me est considéré assez frais pour ne pas être revalidé */
export const USER_ME_REVALIDATION_WINDOW = delta.seconds(30);

const USER_ME_KEY = RQKeys.user_me();

/** teste si une query key est celle de user_me */
export function isUserMeQueryKey(queryKey: readonly unknown[]): boolean {
    return queryKey.length === USER_ME_KEY.length && USER_ME_KEY.every((part, i) => queryKey[i] === part);
}

let lastUserMeInvalidation = 0;

/**
 * Sur une erreur d'autorisation ou d'existence (401/403/404), les droits de l'utilisateur
 * ont pu changer côté serveur : on revalide user_me pour que les gates se ré-évaluent.
 */
function revalidateUserOnAuthError(error: unknown, queryKey?: readonly unknown[]): void {
    const code = (error as Partial<CartesApiException> | undefined)?.code;
    if (code !== 401 && code !== 403 && code !== 404) return;

    // ne pas s'auto-invalider si c'est user_me qui a échoué
    if (queryKey !== undefined && isUserMeQueryKey(queryKey)) return;

    const now = Date.now();
    if (now - lastUserMeInvalidation < USER_ME_REVALIDATION_WINDOW) return;
    lastUserMeInvalidation = now;

    queryClient.invalidateQueries({ queryKey: USER_ME_KEY });
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

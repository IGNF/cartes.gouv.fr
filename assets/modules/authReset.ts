import RQKeys from "@/modules/entrepot/RQKeys";
import { queryClient } from "@/modules/reactQuery";
import { useAuthStore } from "@/stores/AuthStore";

export type AuthResetReason = "session-expired" | "logout";

export function resetAuth(reason: AuthResetReason) {
    const store = useAuthStore.getState();

    if (reason === "logout") {
        store.setLogoutInProgress(true);
        store.setSessionExpired(false);

        // Stop any in-flight requests that could flip UI state during logout navigation.
        void queryClient.cancelQueries();
    }

    if (reason === "session-expired") {
        // Avoid showing a "session expired" alert on a cold start when the user is simply unauthenticated.
        // Only mark the session as expired if we actually had an authenticated user cached.
        const cachedUser = queryClient.getQueryData(RQKeys.user_me()) as unknown;
        const hadAuthenticatedUser = cachedUser !== null && cachedUser !== undefined;

        if (store.sessionExpired || hadAuthenticatedUser) {
            store.setSessionExpired(true);
        }
    }

    // Ensure we don't keep a stale identity cached.
    queryClient.removeQueries({
        queryKey: RQKeys.user_me(),
        exact: true,
    });
}

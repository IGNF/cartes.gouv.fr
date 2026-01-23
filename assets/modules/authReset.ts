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
        store.setSessionExpired(true);
    }

    // Ensure we don't keep a stale identity cached.
    queryClient.removeQueries({
        queryKey: RQKeys.user_me(),
        exact: true,
    });
}

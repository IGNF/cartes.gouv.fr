import { useEffect, useRef } from "react";

import useUserQuery from "./queries/useUserQuery";
import { useAuthStore } from "../stores/AuthStore";

export default function useSyncSessionExpiredFromUser(): void {
    const logoutInProgress = useAuthStore((state) => state.logoutInProgress);
    const sessionExpired = useAuthStore((state) => state.sessionExpired);
    const setSessionExpired = useAuthStore((state) => state.setSessionExpired);

    const userQuery = useUserQuery();
    const user = userQuery.data ?? null;

    const previousUserRef = useRef<typeof user>(user);

    useEffect(() => {
        const previousUser = previousUserRef.current;
        previousUserRef.current = user;

        // If the user is authenticated again (e.g. re-login in another tab),
        // clear any stale "session expired" flag.
        if (user !== null) {
            if (sessionExpired) {
                setSessionExpired(false);
            }
            return;
        }

        // If the app had an authenticated user (Twig bootstrap) but `/users/me` now resolves to null,
        // it usually means the session was lost elsewhere (logout in another tab / expired).
        if (previousUser !== null && user === null && !logoutInProgress) {
            if (!sessionExpired) {
                setSessionExpired(true);
            }
        }
    }, [logoutInProgress, sessionExpired, setSessionExpired, user]);
}

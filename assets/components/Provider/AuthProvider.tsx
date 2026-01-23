import { PropsWithChildren, useEffect } from "react";

import useUserQuery from "@/hooks/queries/useUserQuery";
import RQKeys from "@/modules/entrepot/RQKeys";
import { queryClient } from "@/modules/reactQuery";
import { useAuthStore } from "@/stores/AuthStore";

export default function AuthProvider({ children }: PropsWithChildren) {
    const user = useAuthStore((state) => state.user);
    const setUser = useAuthStore((state) => state.setUser);
    const sessionExpired = useAuthStore((state) => state.sessionExpired);

    const userQuery = useUserQuery({
        initialData: user ?? undefined,
    });

    useEffect(() => {
        if (userQuery.data !== undefined) {
            setUser(userQuery.data);
        }
    }, [setUser, userQuery.data, userQuery.dataUpdatedAt]);

    useEffect(() => {
        if (!sessionExpired) return;

        const refetchUser = () => {
            void queryClient.refetchQueries({
                queryKey: RQKeys.user_me(),
                exact: true,
            });
        };

        const onVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                refetchUser();
            }
        };

        window.addEventListener("focus", refetchUser);
        document.addEventListener("visibilitychange", onVisibilityChange);

        return () => {
            window.removeEventListener("focus", refetchUser);
            document.removeEventListener("visibilitychange", onVisibilityChange);
        };
    }, [sessionExpired]);

    return children;
}

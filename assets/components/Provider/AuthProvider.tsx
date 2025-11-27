import { PropsWithChildren, useEffect } from "react";

import useUserQuery from "@/hooks/queries/useUserQuery";
import { useAuthStore } from "@/stores/AuthStore";

export default function AuthProvider({ children }: PropsWithChildren) {
    const user = useAuthStore((state) => state.user);
    const setUser = useAuthStore((state) => state.setUser);

    const userQuery = useUserQuery({
        initialData: user ?? undefined,
    });

    useEffect(() => {
        if (userQuery.data !== undefined) {
            setUser(userQuery.data);
        }
    }, [setUser, userQuery.data]);

    return children;
}

import { useQuery, UseQueryOptions } from "@tanstack/react-query";

import { CartesUser } from "@/@types/app";
import api from "@/entrepot/api";
import RQKeys from "@/modules/entrepot/RQKeys";
import { ApiError } from "@/modules/jsonFetch";
import { SessionStatus, useSessionStore } from "@/stores/SessionStore";
import { delta } from "@/utils/delta";

type UserQueryOptions = Partial<Omit<UseQueryOptions<CartesUser | null, ApiError, CartesUser | null>, "enabled">>;

/** options de la requête utilisateur ; active seulement en session active : anonyme elle est inutile, expirée le dernier utilisateur reste en cache */
export function userQueryOptions(sessionStatus: SessionStatus): UseQueryOptions<CartesUser | null, ApiError, CartesUser | null> {
    return {
        queryKey: RQKeys.user_me(),
        queryFn: async ({ signal }) => {
            const user = await api.user.getMe({ signal });
            useSessionStore.getState().applyUser(user);
            return user;
        },
        staleTime: delta.minutes(5),
        enabled: sessionStatus === "active",
    };
}

/**
 * Seule source de vérité pour les données de l'utilisateur.
 * Contrat: data === null => anonyme, data objet => authentifié.
 * L'état de chargement doit être lu via les flags React Query (isPending, status...), pas via undefined.
 */
export default function useUserQuery(options?: UserQueryOptions) {
    const sessionStatus = useSessionStore((state) => state.status);
    const { enabled, ...baseOptions } = userQueryOptions(sessionStatus);

    return useQuery<CartesUser | null, ApiError>({ ...baseOptions, ...options, enabled });
}

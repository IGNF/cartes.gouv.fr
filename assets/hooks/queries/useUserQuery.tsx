import { useQuery, UseQueryOptions } from "@tanstack/react-query";

import { CartesUser } from "@/@types/app";
import api from "@/entrepot/api";
import RQKeys from "@/modules/entrepot/RQKeys";
import { ApiError } from "@/modules/jsonFetch";
import { applyUser } from "@/modules/session";
import { useSessionStore } from "@/stores/SessionStore";
import { delta } from "@/utils/delta";

type UserQueryOptions = Partial<Omit<UseQueryOptions<CartesUser | null, ApiError, CartesUser | null>, "enabled">>;

/**
 * Seule source de vérité pour les données de l'utilisateur.
 * Contrat: data === null => anonyme, data objet => authentifié.
 * L'état de chargement doit être lu via les flags React Query (isPending, status...), pas via undefined.
 * La requête ne part qu’en session active : anonyme, elle est inutile ; expirée, le dernier utilisateur reste en cache
 * et la page reste montée jusqu’à la reconnexion.
 */
export default function useUserQuery(options?: UserQueryOptions) {
    const sessionStatus = useSessionStore((state) => state.status);

    return useQuery<CartesUser | null, ApiError>({
        queryKey: RQKeys.user_me(),
        queryFn: async ({ signal }) => {
            const user = await api.user.getMe({ signal });
            applyUser(user);
            return user;
        },
        staleTime: delta.minutes(5),
        ...options,
        enabled: sessionStatus === "active",
    });
}

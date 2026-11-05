import { useQuery, UseQueryOptions } from "@tanstack/react-query";

import { CartesUser } from "@/@types/app";
import api from "@/entrepot/api";
import RQKeys from "@/modules/entrepot/RQKeys";
import { ApiError } from "@/modules/jsonFetch";
import { useAuthStore } from "@/stores/AuthStore";
import { delta } from "@/utils/delta";

/**
 * Seule source de vérité pour les données de l'utilisateur.
 * Contrat: data === null => anonyme, data objet => authentifié.
 * L'état de chargement doit être lu via les flags React Query (isPending, status...), pas via undefined.
 */
export default function useUserQuery(options?: Partial<UseQueryOptions<CartesUser | null, ApiError, CartesUser | null>>) {
    return useQuery<CartesUser | null, ApiError>({
        queryKey: RQKeys.user_me(),
        queryFn: ({ signal }) => api.user.getMe({ signal }),
        staleTime: delta.minutes(5),
        ...options,
        // en pause pendant l’expiration : le dernier utilisateur reste en cache et la page reste montée
        enabled: !useAuthStore((state) => state.sessionExpired),
    });
}

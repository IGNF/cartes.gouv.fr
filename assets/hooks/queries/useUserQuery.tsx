import { useQuery, UseQueryOptions } from "@tanstack/react-query";

import { CartesUser } from "@/@types/app";
import api from "@/entrepot/api";
import RQKeys from "@/modules/entrepot/RQKeys";
import { CartesApiException } from "@/modules/jsonFetch";
import { delta } from "@/utils/delta";

/**
 * Seule source de vérité pour les données de l'utilisateur.
 * Contrat: data === null => anonyme, data objet => authentifié.
 * L'état de chargement doit être lu via les flags React Query (isPending, status...), pas via undefined.
 */
export default function useUserQuery(options?: Partial<UseQueryOptions<CartesUser | null, CartesApiException, CartesUser | null>>) {
    return useQuery<CartesUser | null, CartesApiException>({
        queryKey: RQKeys.user_me(),
        queryFn: ({ signal }) => api.user.getMe({ signal }),
        staleTime: delta.minutes(5),
        ...options,
    });
}

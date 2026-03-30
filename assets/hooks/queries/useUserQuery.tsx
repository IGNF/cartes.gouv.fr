import { useQuery, UseQueryOptions } from "@tanstack/react-query";

import { CartesUser } from "@/@types/app";
import api from "@/entrepot/api";
import RQKeys from "@/modules/entrepot/RQKeys";
import { CartesApiException } from "@/modules/jsonFetch";
import { delta } from "@/utils";

export default function useUserQuery(options?: Partial<UseQueryOptions<CartesUser | null, CartesApiException, CartesUser | null>>) {
    return useQuery<CartesUser | null, CartesApiException>({
        queryKey: RQKeys.user_me(),
        queryFn: ({ signal }) => api.user.getMe({ signal }),
        staleTime: delta.minutes(2),
        refetchOnMount: true, // si stale seulement
        refetchOnWindowFocus: "always", // toujours
        ...options,
    });
}

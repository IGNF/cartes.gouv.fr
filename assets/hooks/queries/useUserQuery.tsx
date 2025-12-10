import { useQuery, UseQueryOptions } from "@tanstack/react-query";

import { CartesUser } from "@/@types/app";
import api from "@/entrepot/api";
import RQKeys from "@/modules/entrepot/RQKeys";
import { CartesApiException } from "@/modules/jsonFetch";
import { delta } from "@/utils/delta";

export default function useUserQuery(options?: Partial<UseQueryOptions<CartesUser, CartesApiException, CartesUser>>) {
    return useQuery<CartesUser, CartesApiException>({
        queryKey: RQKeys.user_me(),
        queryFn: ({ signal }) => api.user.getMe({ signal }),
        staleTime: delta.minutes(5),
        ...options,
    });
}

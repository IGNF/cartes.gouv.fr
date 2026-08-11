import api from "@/entrepot/api";
import RQKeys from "@/entrepot/modules/RQKeys";
import { delta } from "@/utils/delta";

/** Options communes de la requête communauté (loader et useSuspenseQuery du layout) */
export function communityQueryOptions(communityId: string) {
    return {
        queryKey: RQKeys.community(communityId),
        queryFn: ({ signal }: { signal: AbortSignal }) => api.community.get(communityId, { signal }),
        staleTime: delta.seconds(20),
    };
}

/** Options communes de la requête des membres d'une communauté */
export function communityMembersQueryOptions(communityId: string) {
    return {
        queryKey: RQKeys.community_members(communityId),
        queryFn: ({ signal }: { signal: AbortSignal }) => api.community.getMembers(communityId, { signal }),
        staleTime: delta.seconds(20),
    };
}

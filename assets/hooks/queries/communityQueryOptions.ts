import { queryOptions } from "@tanstack/react-query";

import api from "@/entrepot/api";
import RQKeys from "@/modules/entrepot/RQKeys";
import { delta } from "@/utils/delta";

export function communityQueryOptions(communityId: string) {
    return queryOptions({
        queryKey: RQKeys.community(communityId),
        queryFn: ({ signal }) => api.community.get(communityId, { signal }),
        staleTime: delta.seconds(20),
    });
}

export function communityMembersQueryOptions(communityId: string) {
    return queryOptions({
        queryKey: RQKeys.community_members(communityId),
        queryFn: ({ signal }) => api.community.getMembers(communityId, { signal }),
        staleTime: delta.seconds(20),
    });
}

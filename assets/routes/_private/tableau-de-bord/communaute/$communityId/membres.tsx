import { createFileRoute, SearchSchemaInput } from "@tanstack/react-router";

import { CommunityMemberDtoRightsEnum } from "@/@types/entrepot";
import { communityMembersQueryOptions } from "@/entrepot/hooks/queries/communityQueryOptions";
import CommunityMembers from "@/entrepot/pages/communities/CommunityMembers/CommunityMembers";
import { numberParam, optionalStringParam, stringParam } from "@/router/searchParams";

type CommunityMembersSearch = {
    userId?: string;
    page: number;
    limit: number;
    search: string;
};

export const Route = createFileRoute("/_private/tableau-de-bord/communaute/$communityId/membres")({
    validateSearch: (search: { userId?: string; page?: number; limit?: number; search?: string } & SearchSchemaInput): CommunityMembersSearch => ({
        userId: optionalStringParam(search.userId),
        page: numberParam(search.page, 1),
        limit: numberParam(search.limit, 20),
        search: stringParam(search.search, ""),
    }),
    staticData: {
        requiredRights: [CommunityMemberDtoRightsEnum.COMMUNITY],
    },
    loader: ({ context, params }) => {
        void context.queryClient.prefetchQuery(communityMembersQueryOptions(params.communityId));
    },
    component: CommunityMembersRoute,
});

function CommunityMembersRoute() {
    const { userId } = Route.useSearch();
    return <CommunityMembers userId={userId} />;
}

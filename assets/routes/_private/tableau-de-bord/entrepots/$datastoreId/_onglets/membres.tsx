import { createFileRoute, SearchSchemaInput } from "@tanstack/react-router";

import { CommunityMemberDtoRightsEnum } from "@/@types/entrepot";
import ResourceAccessGate from "@/components/Layout/ResourceAccessGate";
import useMembership from "@/hooks/useMembership";
import { communityMembersQueryOptions } from "@/hooks/queries/communityQueryOptions";
import CommunityMembers from "@/entrepot/pages/communities/CommunityMembers/CommunityMembers";
import { positiveIntegerParam, stringParam } from "@/router/searchParams";

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/_onglets/membres")({
    validateSearch: (
        search: { userId?: string; page?: number; limit?: number; search?: string } & SearchSchemaInput
    ): { userId?: string; page: number; limit: number; search: string } => ({
        userId: stringParam(search.userId),
        page: positiveIntegerParam(search.page) ?? 1,
        limit: positiveIntegerParam(search.limit) ?? 20,
        search: stringParam(search.search) ?? "",
    }),
    staticData: { matomoLabel: "Membres", requiredRights: [CommunityMemberDtoRightsEnum.COMMUNITY] },
    loader: ({ context }) => {
        const communityId = context.membership.community?._id;
        if (communityId) void context.queryClient.query(communityMembersQueryOptions(communityId)).catch(() => {});
    },
    component: RouteComponent,
});

function RouteComponent() {
    const communityId = useMembership(Route.useParams())?.community?._id;
    const { userId } = Route.useSearch();
    if (!communityId) return null;
    return (
        <ResourceAccessGate resource={{ communityId }}>
            <CommunityMembers communityId={communityId} userId={userId} />
        </ResourceAccessGate>
    );
}

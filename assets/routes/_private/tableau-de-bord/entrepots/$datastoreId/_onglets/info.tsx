import { createFileRoute } from "@tanstack/react-router";

import ResourceAccessGate from "@/components/Layout/ResourceAccessGate";
import useMembership from "@/hooks/useMembership";
import { communityQueryOptions } from "@/hooks/queries/communityQueryOptions";
import CommunityInfo from "@/entrepot/pages/communities/CommunityInfo/CommunityInfo";

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/_onglets/info")({
    staticData: { matomoLabel: "Fiche communauté" },
    loader: ({ context }) => {
        const communityId = context.membership.community?._id;
        if (communityId) void context.queryClient.query(communityQueryOptions(communityId)).catch(() => {});
    },
    component: RouteComponent,
});

function RouteComponent() {
    const communityId = useMembership(Route.useParams())?.community?._id;
    if (!communityId) return null;
    return (
        <ResourceAccessGate resource={{ communityId }}>
            <CommunityInfo communityId={communityId} />
        </ResourceAccessGate>
    );
}

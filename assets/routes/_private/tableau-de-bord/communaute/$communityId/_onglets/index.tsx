import { createFileRoute } from "@tanstack/react-router";

import CommunityInfo from "@/entrepot/pages/communities/CommunityInfo/CommunityInfo";
import { communityQueryOptions } from "@/hooks/queries/communityQueryOptions";

export const Route = createFileRoute("/_private/tableau-de-bord/communaute/$communityId/_onglets/")({
    staticData: { matomoLabel: "Fiche communauté" },
    loader: ({ context, params }) => {
        void context.queryClient.query(communityQueryOptions(params.communityId)).catch(() => {});
    },
    component: RouteComponent,
});

function RouteComponent() {
    return <CommunityInfo />;
}

import { createFileRoute } from "@tanstack/react-router";

import CommunityInfo from "@/entrepot/pages/communities/CommunityInfo/CommunityInfo";

export const Route = createFileRoute("/_private/tableau-de-bord/communaute/$communityId/_onglets/")({
    staticData: { matomoLabel: "Fiche communauté" },
    component: RouteComponent,
});

function RouteComponent() {
    return <CommunityInfo />;
}

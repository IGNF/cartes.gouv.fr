import { createFileRoute } from "@tanstack/react-router";

import CommunityInfo from "@/entrepot/pages/communities/CommunityInfo/CommunityInfo";

export const Route = createFileRoute("/_private/tableau-de-bord/communaute/$communityId/")({
    component: CommunityInfo,
});

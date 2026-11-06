import { createFileRoute, notFound } from "@tanstack/react-router";

import { CommunityProvider } from "@/espaceco/contexts/CommunityContext";
import CreateCommunity from "@/espaceco/pages/communities/CreateCommunity";

export const Route = createFileRoute("/_private/espace-collaboratif/$communityId/creer-un-guichet")({
    staticData: { matomoLabel: "Création d’un guichet" },
    params: {
        parse: (raw) => ({ communityId: Number(raw.communityId) }),
        stringify: (params) => ({ communityId: String(params.communityId) }),
    },
    beforeLoad: ({ params }) => {
        if (!Number.isInteger(params.communityId)) throw notFound();
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { communityId } = Route.useParams();
    return (
        <CommunityProvider communityId={communityId} mode="creation">
            <CreateCommunity />
        </CommunityProvider>
    );
}

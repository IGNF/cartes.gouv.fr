import { createFileRoute, notFound } from "@tanstack/react-router";

import { CommunityProvider } from "@/espaceco/contexts/CommunityContext";
import CreateCommunity from "@/espaceco/pages/communities/CreateCommunity";
import PageNotFound from "@/pages/error/PageNotFound";

// communityId espaceco = number (params.parse/stringify) ; id non numérique → 404 dans beforeLoad
export const Route = createFileRoute("/_private/espace-collaboratif/$communityId/creer-un-guichet")({
    params: {
        parse: (raw) => ({ communityId: Number(raw.communityId) }),
        stringify: ({ communityId }) => ({ communityId: String(communityId) }),
    },
    beforeLoad: ({ params }) => {
        if (!Number.isInteger(params.communityId)) {
            throw notFound();
        }
    },
    component: CreateCommunityRoute,
    notFoundComponent: PageNotFound,
});

function CreateCommunityRoute() {
    const { communityId } = Route.useParams();

    return (
        <CommunityProvider communityId={communityId} mode={"creation"}>
            <CreateCommunity />
        </CommunityProvider>
    );
}

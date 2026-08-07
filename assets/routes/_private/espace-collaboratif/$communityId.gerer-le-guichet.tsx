import { createFileRoute, notFound, SearchSchemaInput } from "@tanstack/react-router";

import { CommunityProvider } from "@/espaceco/contexts/CommunityContext";
import ManageCommunity from "@/espaceco/pages/communities/ManageCommunity";
import { stringParam } from "@/router/searchParams";

type ManageCommunitySearch = {
    activeTab: string;
};

// communityId espaceco = number (params.parse/stringify) ; id non numérique → 404 dans beforeLoad
export const Route = createFileRoute("/_private/espace-collaboratif/$communityId/gerer-le-guichet")({
    params: {
        parse: (raw) => ({ communityId: Number(raw.communityId) }),
        stringify: ({ communityId }) => ({ communityId: String(communityId) }),
    },
    validateSearch: (search: { activeTab?: string } & SearchSchemaInput): ManageCommunitySearch => ({
        activeTab: stringParam(search.activeTab, "description"),
    }),
    beforeLoad: ({ params }) => {
        if (!Number.isInteger(params.communityId)) {
            throw notFound();
        }
    },
    component: ManageCommunityRoute,
});

function ManageCommunityRoute() {
    const { communityId } = Route.useParams();

    return (
        <CommunityProvider communityId={communityId} mode={"edition"}>
            <ManageCommunity />
        </CommunityProvider>
    );
}

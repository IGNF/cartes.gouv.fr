import { createFileRoute, notFound, SearchSchemaInput, stripSearchParams } from "@tanstack/react-router";

import { ManageCommunityActiveTabEnum } from "@/@types/app_espaceco";
import { CommunityProvider } from "@/espaceco/contexts/CommunityContext";
import ManageCommunity from "@/espaceco/pages/communities/ManageCommunity";
import { enumParam } from "@/router/searchParams";

// valeurs par défaut absentes de l’URL, comme avant la bascule
const defaults = { activeTab: ManageCommunityActiveTabEnum.Description } as const;

export const Route = createFileRoute("/_private/espace-collaboratif/$communityId/gerer-le-guichet")({
    params: {
        parse: (raw) => ({ communityId: Number(raw.communityId) }),
        stringify: (params) => ({ communityId: String(params.communityId) }),
    },
    validateSearch: (search: { activeTab?: `${ManageCommunityActiveTabEnum}` } & SearchSchemaInput): { activeTab: ManageCommunityActiveTabEnum } => ({
        activeTab: enumParam(search.activeTab, Object.values(ManageCommunityActiveTabEnum)) ?? defaults.activeTab,
    }),
    search: { middlewares: [stripSearchParams(defaults)] },
    staticData: { matomoLabel: "Gérer le guichet" },
    beforeLoad: ({ params }) => {
        if (!Number.isInteger(params.communityId)) throw notFound();
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { communityId } = Route.useParams();
    return (
        <CommunityProvider communityId={communityId} mode="edition">
            <ManageCommunity />
        </CommunityProvider>
    );
}

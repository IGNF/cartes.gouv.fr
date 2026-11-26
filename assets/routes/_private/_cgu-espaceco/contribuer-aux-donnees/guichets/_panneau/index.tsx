import { createFileRoute, SearchSchemaInput } from "@tanstack/react-router";

import { arrCommunityListFilters, type CommunityListFilter } from "@/@types/app_espaceco";
import Communities from "@/espaceco/pages/communities/Communities";
import { enumParam, positiveIntegerParam } from "@/router/searchParams";

export const Route = createFileRoute("/_private/_cgu-espaceco/contribuer-aux-donnees/guichets/_panneau/")({
    validateSearch: (
        search: { page?: number; filter?: CommunityListFilter; community?: number } & SearchSchemaInput
    ): { page: number; filter: CommunityListFilter; community?: number } => ({
        page: positiveIntegerParam(search.page) ?? 1,
        filter: enumParam(search.filter, arrCommunityListFilters) ?? "iam_member",
        community: positiveIntegerParam(search.community),
    }),
    staticData: { matomoLabel: "Liste des guichets" },
    component: RouteComponent,
});

function RouteComponent() {
    return <Communities />;
}

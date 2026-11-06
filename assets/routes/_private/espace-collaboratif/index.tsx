import { createFileRoute, SearchSchemaInput } from "@tanstack/react-router";

import { arrCommunityListFilters, type CommunityListFilter } from "@/@types/app_espaceco";
import Communities from "@/espaceco/pages/communities/Communities";
import { enumParam, positiveIntegerParam } from "@/router/searchParams";

export const Route = createFileRoute("/_private/espace-collaboratif/")({
    validateSearch: (search: { page?: number; filter?: CommunityListFilter } & SearchSchemaInput): { page: number; filter: CommunityListFilter } => ({
        page: positiveIntegerParam(search.page) ?? 1,
        filter: enumParam(search.filter, arrCommunityListFilters) ?? "listed",
    }),
    staticData: { matomoLabel: "Liste des guichets" },
    component: RouteComponent,
});

function RouteComponent() {
    return <Communities />;
}

import { createFileRoute, SearchSchemaInput, stripSearchParams } from "@tanstack/react-router";

import { arrCommunityListFilters, type CommunityListFilter } from "@/@types/app_espaceco";
import Communities from "@/espaceco/pages/communities/Communities";
import { enumParam, positiveIntegerParam } from "@/router/searchParams";

// valeurs par défaut absentes de l’URL, comme avant la bascule
const defaults = { page: 1, filter: "listed" } as const;

export const Route = createFileRoute("/_private/espace-collaboratif/")({
    validateSearch: (search: { page?: number; filter?: CommunityListFilter } & SearchSchemaInput): { page: number; filter: CommunityListFilter } => ({
        page: positiveIntegerParam(search.page) ?? defaults.page,
        filter: enumParam(search.filter, arrCommunityListFilters) ?? defaults.filter,
    }),
    search: { middlewares: [stripSearchParams(defaults)] },
    staticData: { matomoLabel: "Liste des guichets" },
    component: RouteComponent,
});

function RouteComponent() {
    return <Communities />;
}

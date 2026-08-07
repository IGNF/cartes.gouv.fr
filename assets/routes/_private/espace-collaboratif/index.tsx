import { createFileRoute, SearchSchemaInput } from "@tanstack/react-router";

import Communities from "@/espaceco/pages/communities/Communities";
import { numberParam, stringParam } from "@/router/searchParams";

type CommunityListSearch = {
    page: number;
    filter: string;
};

export const Route = createFileRoute("/_private/espace-collaboratif/")({
    validateSearch: (search: { page?: number; filter?: string } & SearchSchemaInput): CommunityListSearch => ({
        page: numberParam(search.page, 1),
        filter: stringParam(search.filter, "listed"),
    }),
    component: Communities,
});

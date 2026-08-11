import { createFileRoute, SearchSchemaInput } from "@tanstack/react-router";

import { datasheetListQueryOptions } from "@/entrepot/hooks/queries/datasheetListQueryOptions";
import DatasheetList from "@/entrepot/pages/datasheet/DatasheetList/DatasheetList";
import { numberParam, optionalStringParam } from "@/router/searchParams";

type DatasheetListSearch = {
    page: number;
    limit: number;
    search?: string;
    sortBy?: string;
    sortOrder: number;
    published: number;
};

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/donnees/")({
    validateSearch: (
        search: { page?: number; limit?: number; search?: string; sortBy?: string; sortOrder?: number; published?: number } & SearchSchemaInput
    ): DatasheetListSearch => ({
        page: numberParam(search.page, 1),
        limit: numberParam(search.limit, 10),
        search: optionalStringParam(search.search),
        sortBy: optionalStringParam(search.sortBy),
        sortOrder: numberParam(search.sortOrder, 1),
        published: numberParam(search.published, 0),
    }),
    loader: ({ context, params }) => {
        void context.queryClient.prefetchQuery(datasheetListQueryOptions(params.datastoreId));
    },
    component: DatasheetListRoute,
});

function DatasheetListRoute() {
    const { datastoreId } = Route.useParams();
    return <DatasheetList datastoreId={datastoreId} />;
}

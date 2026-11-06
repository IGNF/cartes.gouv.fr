import { createFileRoute, SearchSchemaInput } from "@tanstack/react-router";

import { datasheetListQueryOptions } from "@/hooks/queries/datasheetListQueryOptions";
import DatasheetList from "@/entrepot/pages/datasheet/DatasheetList/DatasheetList";
import { FilterEnum } from "@/hooks/useFilters";
import { SortOrderEnum } from "@/hooks/useSort";
import { enumParam, positiveIntegerParam, stringParam } from "@/router/searchParams";

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/_onglets/donnees/")({
    validateSearch: (
        search: { page?: number; limit?: number; search?: string; sortBy?: string; sortOrder?: SortOrderEnum; published?: FilterEnum } & SearchSchemaInput
    ): { page: number; limit: number; search?: string; sortBy?: string; sortOrder: SortOrderEnum; published: FilterEnum } => ({
        page: positiveIntegerParam(search.page) ?? 1,
        limit: positiveIntegerParam(search.limit) ?? 10,
        search: stringParam(search.search),
        sortBy: stringParam(search.sortBy),
        sortOrder: enumParam(search.sortOrder, [SortOrderEnum.ASCENDING, SortOrderEnum.DESCENDING]) ?? SortOrderEnum.ASCENDING,
        published: enumParam(search.published, [FilterEnum.ALL, FilterEnum.ENABLED, FilterEnum.DISABLED]) ?? FilterEnum.ALL,
    }),
    staticData: { matomoLabel: "Données entrepôt" },
    loader: ({ context, params }) => {
        void context.queryClient.query(datasheetListQueryOptions(params.datastoreId)).catch(() => {});
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { datastoreId } = Route.useParams();
    return <DatasheetList datastoreId={datastoreId} />;
}

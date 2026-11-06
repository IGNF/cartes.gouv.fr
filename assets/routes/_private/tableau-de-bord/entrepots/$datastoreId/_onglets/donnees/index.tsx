import { createFileRoute, SearchSchemaInput, stripSearchParams } from "@tanstack/react-router";

import DatasheetList from "@/entrepot/pages/datasheet/DatasheetList/DatasheetList";
import { FilterEnum } from "@/hooks/useFilters";
import { SortOrderEnum } from "@/hooks/useSort";
import { enumParam, positiveIntegerParam, stringParam } from "@/router/searchParams";

// valeurs par défaut absentes de l’URL, comme avant la bascule
const defaults = { page: 1, limit: 10, sortOrder: SortOrderEnum.ASCENDING, published: FilterEnum.ALL } as const;

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/_onglets/donnees/")({
    validateSearch: (
        search: { page?: number; limit?: number; search?: string; sortBy?: string; sortOrder?: SortOrderEnum; published?: FilterEnum } & SearchSchemaInput
    ): { page: number; limit: number; search?: string; sortBy?: string; sortOrder: SortOrderEnum; published: FilterEnum } => ({
        page: positiveIntegerParam(search.page) ?? defaults.page,
        limit: positiveIntegerParam(search.limit) ?? defaults.limit,
        search: stringParam(search.search),
        sortBy: stringParam(search.sortBy),
        sortOrder: enumParam(search.sortOrder, [SortOrderEnum.ASCENDING, SortOrderEnum.DESCENDING]) ?? defaults.sortOrder,
        published: enumParam(search.published, [FilterEnum.ALL, FilterEnum.ENABLED, FilterEnum.DISABLED]) ?? defaults.published,
    }),
    search: { middlewares: [stripSearchParams(defaults)] },
    staticData: { matomoLabel: "Données entrepôt" },
    component: RouteComponent,
});

function RouteComponent() {
    const { datastoreId } = Route.useParams();
    return <DatasheetList datastoreId={datastoreId} />;
}

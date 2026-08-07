import { createFileRoute, SearchSchemaInput } from "@tanstack/react-router";

import DatastoreSelection from "@/entrepot/pages/datastore/DatastoreSelection/DatastoreSelection";
import { numberParam, stringParam } from "@/router/searchParams";

type DatastoreSelectionSearch = {
    page: number;
    limit: number;
    search: string;
};

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/")({
    validateSearch: (search: { page?: number; limit?: number; search?: string } & SearchSchemaInput): DatastoreSelectionSearch => ({
        page: numberParam(search.page, 1),
        limit: numberParam(search.limit, 20),
        search: stringParam(search.search, ""),
    }),
    component: DatastoreSelection,
});

import { createFileRoute, SearchSchemaInput } from "@tanstack/react-router";

import DatastoreManageStorage from "@/entrepot/pages/datastore/ManageStorage/DatastoreManageStorage";
import { numberParam, stringParam } from "@/router/searchParams";

type ManageStorageSearch = {
    tab: string;
    page: number;
    limit: number;
};

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/consommation")({
    validateSearch: (search: { tab?: string; page?: number; limit?: number } & SearchSchemaInput): ManageStorageSearch => ({
        tab: stringParam(search.tab, "postgresql"),
        page: numberParam(search.page, 1),
        limit: numberParam(search.limit, 10),
    }),
    component: DatastoreManageStorage,
});

import { createFileRoute, SearchSchemaInput } from "@tanstack/react-router";

import DatastoreManageStorage from "@/entrepot/pages/datastore/ManageStorage/DatastoreManageStorage";
import { DatastoreManageStorageTab } from "@/entrepot/pages/datastore/ManageStorage/types";
import { enumParam, positiveIntegerParam } from "@/router/searchParams";

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/_onglets/consommation")({
    validateSearch: (
        search: { tab?: `${DatastoreManageStorageTab}`; page?: number; limit?: number } & SearchSchemaInput
    ): { tab: DatastoreManageStorageTab; page: number; limit: number } => ({
        tab: enumParam(search.tab, Object.values(DatastoreManageStorageTab)) ?? DatastoreManageStorageTab.POSTGRESQL,
        page: positiveIntegerParam(search.page) ?? 1,
        limit: positiveIntegerParam(search.limit) ?? 10,
    }),
    staticData: { matomoLabel: "Consommation entrepôt" },
    component: RouteComponent,
});

function RouteComponent() {
    return <DatastoreManageStorage />;
}

import { createFileRoute, SearchSchemaInput, stripSearchParams } from "@tanstack/react-router";

import DatastoreManageStorage from "@/entrepot/pages/datastore/ManageStorage/DatastoreManageStorage";
import { DatastoreManageStorageTab } from "@/entrepot/pages/datastore/ManageStorage/types";
import { enumParam, positiveIntegerParam } from "@/router/searchParams";

// valeurs par défaut absentes de l’URL, comme avant la bascule
const defaults = { tab: DatastoreManageStorageTab.POSTGRESQL, page: 1, limit: 10 } as const;

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/_onglets/consommation")({
    validateSearch: (
        search: { tab?: `${DatastoreManageStorageTab}`; page?: number; limit?: number } & SearchSchemaInput
    ): { tab: DatastoreManageStorageTab; page: number; limit: number } => ({
        tab: enumParam(search.tab, Object.values(DatastoreManageStorageTab)) ?? defaults.tab,
        page: positiveIntegerParam(search.page) ?? defaults.page,
        limit: positiveIntegerParam(search.limit) ?? defaults.limit,
    }),
    search: { middlewares: [stripSearchParams(defaults)] },
    staticData: { matomoLabel: "Consommation entrepôt" },
    component: RouteComponent,
});

function RouteComponent() {
    return <DatastoreManageStorage />;
}

import { createFileRoute, SearchSchemaInput } from "@tanstack/react-router";

import DatastoreSelection from "@/entrepot/pages/datastore/DatastoreSelection/DatastoreSelection";
import { positiveIntegerParam, stringParam } from "@/router/searchParams";

export const Route = createFileRoute("/_private/_panneau/tableau-de-bord/entrepots/")({
    validateSearch: (search: { page?: number; limit?: number; search?: string } & SearchSchemaInput): { page: number; limit: number; search: string } => ({
        page: positiveIntegerParam(search.page) ?? 1,
        limit: positiveIntegerParam(search.limit) ?? 20,
        search: stringParam(search.search) ?? "",
    }),
    staticData: { matomoLabel: "Entrepôts" },
    component: RouteComponent,
});

function RouteComponent() {
    return <DatastoreSelection />;
}

import { createFileRoute, SearchSchemaInput, stripSearchParams } from "@tanstack/react-router";

import DatastoreSelection from "@/entrepot/pages/datastore/DatastoreSelection/DatastoreSelection";
import { positiveIntegerParam, stringParam } from "@/router/searchParams";

// valeurs par défaut absentes de l’URL, comme avant la bascule
const defaults = { page: 1, limit: 20, search: "" } as const;

export const Route = createFileRoute("/_private/_panneau/tableau-de-bord/entrepots/")({
    validateSearch: (search: { page?: number; limit?: number; search?: string } & SearchSchemaInput): { page: number; limit: number; search: string } => ({
        page: positiveIntegerParam(search.page) ?? defaults.page,
        limit: positiveIntegerParam(search.limit) ?? defaults.limit,
        search: stringParam(search.search) ?? defaults.search,
    }),
    search: { middlewares: [stripSearchParams(defaults)] },
    staticData: { matomoLabel: "Entrepôts" },
    component: RouteComponent,
});

function RouteComponent() {
    return <DatastoreSelection />;
}

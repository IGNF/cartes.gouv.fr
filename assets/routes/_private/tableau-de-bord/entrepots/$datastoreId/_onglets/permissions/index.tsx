import { createFileRoute, SearchSchemaInput, stripSearchParams } from "@tanstack/react-router";

import DatastoreManagePermissions from "@/entrepot/pages/datastore/ManagePermissions/DatastoreManagePermissions";
import { positiveIntegerParam } from "@/router/searchParams";

// valeurs par défaut absentes de l’URL, comme avant la bascule
const defaults = { page: 1, limit: 4 } as const;

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/_onglets/permissions/")({
    validateSearch: (search: { page?: number; limit?: number } & SearchSchemaInput): { page: number; limit: number } => ({
        page: positiveIntegerParam(search.page) ?? defaults.page,
        limit: positiveIntegerParam(search.limit) ?? defaults.limit,
    }),
    search: { middlewares: [stripSearchParams(defaults)] },
    staticData: { matomoLabel: "Permissions entrepôt" },
    component: RouteComponent,
});

function RouteComponent() {
    const { datastoreId } = Route.useParams();
    return <DatastoreManagePermissions datastoreId={datastoreId} />;
}

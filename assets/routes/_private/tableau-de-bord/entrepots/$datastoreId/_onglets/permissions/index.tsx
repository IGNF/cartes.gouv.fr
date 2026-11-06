import { createFileRoute, SearchSchemaInput } from "@tanstack/react-router";

import DatastoreManagePermissions from "@/entrepot/pages/datastore/ManagePermissions/DatastoreManagePermissions";
import { positiveIntegerParam } from "@/router/searchParams";

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/_onglets/permissions/")({
    validateSearch: (search: { page?: number; limit?: number } & SearchSchemaInput): { page: number; limit: number } => ({
        page: positiveIntegerParam(search.page) ?? 1,
        limit: positiveIntegerParam(search.limit) ?? 4,
    }),
    staticData: { matomoLabel: "Permissions entrepôt" },
    component: RouteComponent,
});

function RouteComponent() {
    const { datastoreId } = Route.useParams();
    return <DatastoreManagePermissions datastoreId={datastoreId} />;
}

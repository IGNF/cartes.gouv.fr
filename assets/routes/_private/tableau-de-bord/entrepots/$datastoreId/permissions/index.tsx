import { createFileRoute, SearchSchemaInput } from "@tanstack/react-router";

import DatastoreManagePermissions from "@/entrepot/pages/datastore/ManagePermissions/DatastoreManagePermissions";
import { numberParam } from "@/router/searchParams";

type ManagePermissionsSearch = {
    page: number;
    limit: number;
};

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/permissions/")({
    validateSearch: (search: { page?: number; limit?: number } & SearchSchemaInput): ManagePermissionsSearch => ({
        page: numberParam(search.page, 1),
        limit: numberParam(search.limit, 4),
    }),
    component: ManagePermissionsRoute,
});

function ManagePermissionsRoute() {
    const { datastoreId } = Route.useParams();
    return <DatastoreManagePermissions datastoreId={datastoreId} />;
}

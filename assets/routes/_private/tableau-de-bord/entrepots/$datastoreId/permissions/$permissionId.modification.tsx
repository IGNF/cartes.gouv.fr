import { createFileRoute } from "@tanstack/react-router";

import EditPermissionForm from "@/entrepot/pages/datastore/ManagePermissions/EditPermissionForm";

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/permissions/$permissionId/modification")({
    component: EditPermissionRoute,
});

function EditPermissionRoute() {
    const { datastoreId, permissionId } = Route.useParams();
    return <EditPermissionForm datastoreId={datastoreId} permissionId={permissionId} />;
}

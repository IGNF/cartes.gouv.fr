import { createFileRoute } from "@tanstack/react-router";

import EditPermissionForm from "@/entrepot/pages/datastore/ManagePermissions/EditPermissionForm";

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/permissions/$permissionId/modification")({
    staticData: { matomoLabel: "Mise à jour d’une permission" },
    component: RouteComponent,
});

function RouteComponent() {
    const { datastoreId, permissionId } = Route.useParams();
    return <EditPermissionForm datastoreId={datastoreId} permissionId={permissionId} />;
}

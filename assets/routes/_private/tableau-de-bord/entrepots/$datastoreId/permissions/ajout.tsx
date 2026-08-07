import { createFileRoute } from "@tanstack/react-router";

import AddPermissionForm from "@/entrepot/pages/datastore/ManagePermissions/AddPermissionForm";

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/permissions/ajout")({
    component: AddPermissionRoute,
});

function AddPermissionRoute() {
    const { datastoreId } = Route.useParams();
    return <AddPermissionForm datastoreId={datastoreId} />;
}

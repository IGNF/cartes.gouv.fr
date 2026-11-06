import { createFileRoute } from "@tanstack/react-router";

import AddPermissionForm from "@/entrepot/pages/datastore/ManagePermissions/AddPermissionForm";

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/permissions/ajout")({
    staticData: { matomoLabel: "Ajout d’une permission" },
    component: RouteComponent,
});

function RouteComponent() {
    const { datastoreId } = Route.useParams();
    return <AddPermissionForm datastoreId={datastoreId} />;
}

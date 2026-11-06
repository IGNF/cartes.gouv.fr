import { createFileRoute } from "@tanstack/react-router";

import DatastoreAdd from "@/entrepot/pages/datastore/DatastoreAdd/DatastoreAdd";

export const Route = createFileRoute("/_private/_panneau/tableau-de-bord/entrepots/demande-de-creation")({
    staticData: { matomoLabel: "Ajouter un entrepôt" },
    component: RouteComponent,
});

function RouteComponent() {
    return <DatastoreAdd mode="create" />;
}

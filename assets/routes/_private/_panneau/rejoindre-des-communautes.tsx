import { createFileRoute } from "@tanstack/react-router";

import DatastoreAdd from "@/entrepot/pages/datastore/DatastoreAdd/DatastoreAdd";

export const Route = createFileRoute("/_private/_panneau/rejoindre-des-communautes")({
    staticData: { matomoLabel: "Ajouter un entrepôt" },
    component: RouteComponent,
});

function RouteComponent() {
    return <DatastoreAdd />;
}

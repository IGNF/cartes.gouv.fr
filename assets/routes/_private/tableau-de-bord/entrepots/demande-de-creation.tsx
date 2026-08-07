import { createFileRoute } from "@tanstack/react-router";

import DatastoreAdd from "@/entrepot/pages/datastore/DatastoreAdd/DatastoreAdd";

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/demande-de-creation")({
    component: DatastoreAdd,
});

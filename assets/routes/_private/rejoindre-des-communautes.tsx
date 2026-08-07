import { createFileRoute } from "@tanstack/react-router";

import DatastoreAdd from "@/entrepot/pages/datastore/DatastoreAdd/DatastoreAdd";

export const Route = createFileRoute("/_private/rejoindre-des-communautes")({
    component: DatastoreAdd,
});

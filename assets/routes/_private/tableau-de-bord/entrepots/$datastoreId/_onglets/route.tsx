import { createFileRoute } from "@tanstack/react-router";

import DatastoreTabsLayout from "@/components/Layout/DatastoreTabsLayout";

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/_onglets")({
    component: DatastoreTabsLayout,
});

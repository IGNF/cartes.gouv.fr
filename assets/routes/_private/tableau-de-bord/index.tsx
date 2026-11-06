import { createFileRoute } from "@tanstack/react-router";

import Dashboard from "@/entrepot/pages/dashboard/Dashboard";

export const Route = createFileRoute("/_private/tableau-de-bord/")({
    staticData: { matomoLabel: "Tableau de bord" },
    component: RouteComponent,
});

function RouteComponent() {
    return <Dashboard />;
}

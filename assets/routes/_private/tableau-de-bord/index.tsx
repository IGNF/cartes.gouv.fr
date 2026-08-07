import { createFileRoute } from "@tanstack/react-router";

import Dashboard from "@/entrepot/pages/dashboard/Dashboard";

export const Route = createFileRoute("/_private/tableau-de-bord/")({
    component: Dashboard,
});

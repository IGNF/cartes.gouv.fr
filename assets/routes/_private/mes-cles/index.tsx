import { createFileRoute } from "@tanstack/react-router";

import MyAccessKeys from "@/entrepot/pages/users/access-keys/MyAccessKeys";

export const Route = createFileRoute("/_private/mes-cles/")({
    staticData: { matomoLabel: "Mes clés d’accès" },
    component: RouteComponent,
});

function RouteComponent() {
    return <MyAccessKeys activeTab="keys" />;
}

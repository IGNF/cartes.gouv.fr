import { createFileRoute } from "@tanstack/react-router";

import LoginDisabled from "@/pages/LoginDisabled/LoginDisabled";

export const Route = createFileRoute("/_public/connexion-desactivee")({
    staticData: { matomoLabel: "Connexion momentanément désactivée" },
    component: RouteComponent,
});

function RouteComponent() {
    return <LoginDisabled />;
}

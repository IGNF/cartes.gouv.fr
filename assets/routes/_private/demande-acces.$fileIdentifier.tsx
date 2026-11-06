import { createFileRoute } from "@tanstack/react-router";

import AccessesRequest from "@/entrepot/pages/accesses-request/AccessesRequest";

export const Route = createFileRoute("/_private/demande-acces/$fileIdentifier")({
    staticData: { matomoLabel: "Demande d’accès" },
    component: RouteComponent,
});

function RouteComponent() {
    const { fileIdentifier } = Route.useParams();
    return <AccessesRequest fileIdentifier={fileIdentifier} />;
}

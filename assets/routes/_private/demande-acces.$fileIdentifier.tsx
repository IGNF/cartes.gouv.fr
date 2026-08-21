import { createFileRoute } from "@tanstack/react-router";

import AccessesRequest from "@/entrepot/pages/accesses-request/AccessesRequest";

export const Route = createFileRoute("/_private/demande-acces/$fileIdentifier")({
    component: AccessesRequestRoute,
});

function AccessesRequestRoute() {
    const { fileIdentifier } = Route.useParams();
    return <AccessesRequest fileIdentifier={fileIdentifier} />;
}

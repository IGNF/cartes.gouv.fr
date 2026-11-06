import { createFileRoute, SearchSchemaInput } from "@tanstack/react-router";

import ServiceView from "@/entrepot/pages/service/view/ServiceView";
import { requiredStringParam } from "@/router/searchParams";

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/service/$offeringId/visualisation")({
    validateSearch: (search: { datasheetName: string } & SearchSchemaInput): { datasheetName: string } => ({
        datasheetName: requiredStringParam(search.datasheetName, "datasheetName"),
    }),
    staticData: { matomoLabel: "Visualisation données" },
    component: RouteComponent,
});

function RouteComponent() {
    const params = Route.useParams();
    const search = Route.useSearch();
    return <ServiceView datastoreId={params.datastoreId} offeringId={params.offeringId} datasheetName={search.datasheetName} />;
}

import { createFileRoute, SearchSchemaInput } from "@tanstack/react-router";

import ServiceView from "@/entrepot/pages/service/view/ServiceView";
import { requiredStringParam } from "@/router/searchParams";

type ServiceViewSearch = {
    datasheetName: string;
};

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/service/$offeringId/visualisation")({
    validateSearch: (search: { datasheetName: string } & SearchSchemaInput): ServiceViewSearch => ({
        datasheetName: requiredStringParam(search.datasheetName, "datasheetName"),
    }),
    component: ServiceViewRoute,
});

function ServiceViewRoute() {
    const { datastoreId, offeringId } = Route.useParams();
    const { datasheetName } = Route.useSearch();
    return <ServiceView datastoreId={datastoreId} offeringId={offeringId} datasheetName={datasheetName} />;
}

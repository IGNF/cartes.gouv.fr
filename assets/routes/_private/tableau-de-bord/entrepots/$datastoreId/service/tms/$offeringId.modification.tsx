import { createFileRoute, SearchSchemaInput } from "@tanstack/react-router";

import PyramidVectorTmsServiceForm from "@/entrepot/pages/service/tms/PyramidVectorTmsServiceForm/PyramidVectorTmsServiceForm";
import { requiredStringParam } from "@/router/searchParams";

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/service/tms/$offeringId/modification")({
    validateSearch: (search: { pyramidId: string; datasheetName: string } & SearchSchemaInput): { pyramidId: string; datasheetName: string } => ({
        pyramidId: requiredStringParam(search.pyramidId, "pyramidId"),
        datasheetName: requiredStringParam(search.datasheetName, "datasheetName"),
    }),
    staticData: { matomoLabel: "Modifier le service TMS" },
    component: RouteComponent,
});

function RouteComponent() {
    const params = Route.useParams();
    const search = Route.useSearch();
    return <PyramidVectorTmsServiceForm datastoreId={params.datastoreId} pyramidId={search.pyramidId} offeringId={params.offeringId} />;
}

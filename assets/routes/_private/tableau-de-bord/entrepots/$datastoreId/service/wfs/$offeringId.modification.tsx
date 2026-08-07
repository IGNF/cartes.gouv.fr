import { createFileRoute, SearchSchemaInput } from "@tanstack/react-router";

import WfsServiceForm from "@/entrepot/pages/service/wfs/WfsServiceForm";
import { requiredStringParam } from "@/router/searchParams";

type WfsServiceEditSearch = {
    vectorDbId: string;
    datasheetName: string;
};

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/service/wfs/$offeringId/modification")({
    validateSearch: (search: { vectorDbId: string; datasheetName: string } & SearchSchemaInput): WfsServiceEditSearch => ({
        vectorDbId: requiredStringParam(search.vectorDbId, "vectorDbId"),
        datasheetName: requiredStringParam(search.datasheetName, "datasheetName"),
    }),
    component: WfsServiceEditRoute,
});

function WfsServiceEditRoute() {
    const { datastoreId, offeringId } = Route.useParams();
    const { vectorDbId } = Route.useSearch();
    return <WfsServiceForm datastoreId={datastoreId} vectorDbId={vectorDbId} offeringId={offeringId} />;
}

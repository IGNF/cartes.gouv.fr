import { createFileRoute, SearchSchemaInput } from "@tanstack/react-router";

import WmsVectorServiceForm from "@/entrepot/pages/service/wms-vector/WmsVectorServiceForm";
import { requiredStringParam } from "@/router/searchParams";

type WmsVectorServiceEditSearch = {
    vectorDbId: string;
    datasheetName: string;
};

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/service/wms-vecteur/$offeringId/modification")({
    validateSearch: (search: { vectorDbId: string; datasheetName: string } & SearchSchemaInput): WmsVectorServiceEditSearch => ({
        vectorDbId: requiredStringParam(search.vectorDbId, "vectorDbId"),
        datasheetName: requiredStringParam(search.datasheetName, "datasheetName"),
    }),
    component: WmsVectorServiceEditRoute,
});

function WmsVectorServiceEditRoute() {
    const { datastoreId, offeringId } = Route.useParams();
    const { vectorDbId } = Route.useSearch();
    return <WmsVectorServiceForm datastoreId={datastoreId} vectorDbId={vectorDbId} offeringId={offeringId} />;
}

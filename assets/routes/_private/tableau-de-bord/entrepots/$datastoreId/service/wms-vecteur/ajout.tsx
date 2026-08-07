import { createFileRoute, SearchSchemaInput } from "@tanstack/react-router";

import WmsVectorServiceForm from "@/entrepot/pages/service/wms-vector/WmsVectorServiceForm";
import { requiredStringParam } from "@/router/searchParams";

type WmsVectorServiceNewSearch = {
    vectorDbId: string;
    datasheetName: string;
};

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/service/wms-vecteur/ajout")({
    validateSearch: (search: { vectorDbId: string; datasheetName: string } & SearchSchemaInput): WmsVectorServiceNewSearch => ({
        vectorDbId: requiredStringParam(search.vectorDbId, "vectorDbId"),
        datasheetName: requiredStringParam(search.datasheetName, "datasheetName"),
    }),
    component: WmsVectorServiceNewRoute,
});

function WmsVectorServiceNewRoute() {
    const { datastoreId } = Route.useParams();
    const { vectorDbId } = Route.useSearch();
    return <WmsVectorServiceForm datastoreId={datastoreId} vectorDbId={vectorDbId} />;
}

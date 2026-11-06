import { createFileRoute, SearchSchemaInput } from "@tanstack/react-router";

import PyramidRasterWmsRasterServiceForm from "@/entrepot/pages/service/wms-raster-wmts/PyramidRasterWmsRasterServiceForm/PyramidRasterWmsRasterServiceForm";
import { requiredStringParam } from "@/router/searchParams";

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/service/wms-raster/$offeringId/modification")({
    validateSearch: (search: { pyramidId: string; datasheetName: string } & SearchSchemaInput): { pyramidId: string; datasheetName: string } => ({
        pyramidId: requiredStringParam(search.pyramidId, "pyramidId"),
        datasheetName: requiredStringParam(search.datasheetName, "datasheetName"),
    }),
    staticData: { matomoLabel: "Modifier le service WMS-Raster" },
    component: RouteComponent,
});

function RouteComponent() {
    const params = Route.useParams();
    const search = Route.useSearch();
    return (
        <PyramidRasterWmsRasterServiceForm
            datastoreId={params.datastoreId}
            pyramidId={search.pyramidId}
            datasheetName={search.datasheetName}
            offeringId={params.offeringId}
        />
    );
}

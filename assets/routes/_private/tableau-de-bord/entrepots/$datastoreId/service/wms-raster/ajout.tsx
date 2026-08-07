import { createFileRoute, SearchSchemaInput } from "@tanstack/react-router";

import PyramidRasterWmsRasterServiceForm from "@/entrepot/pages/service/wms-raster-wmts/PyramidRasterWmsRasterServiceForm/PyramidRasterWmsRasterServiceForm";
import { requiredStringParam } from "@/router/searchParams";

type WmsRasterServiceNewSearch = {
    pyramidId: string;
    datasheetName: string;
};

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/service/wms-raster/ajout")({
    validateSearch: (search: { pyramidId: string; datasheetName: string } & SearchSchemaInput): WmsRasterServiceNewSearch => ({
        pyramidId: requiredStringParam(search.pyramidId, "pyramidId"),
        datasheetName: requiredStringParam(search.datasheetName, "datasheetName"),
    }),
    component: WmsRasterServiceNewRoute,
});

function WmsRasterServiceNewRoute() {
    const { datastoreId } = Route.useParams();
    const { pyramidId, datasheetName } = Route.useSearch();
    return <PyramidRasterWmsRasterServiceForm datastoreId={datastoreId} pyramidId={pyramidId} datasheetName={datasheetName} />;
}

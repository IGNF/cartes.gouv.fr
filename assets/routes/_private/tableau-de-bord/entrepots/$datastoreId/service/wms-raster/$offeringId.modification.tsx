import { createFileRoute, SearchSchemaInput } from "@tanstack/react-router";

import PyramidRasterWmsRasterServiceForm from "@/entrepot/pages/service/wms-raster-wmts/PyramidRasterWmsRasterServiceForm/PyramidRasterWmsRasterServiceForm";
import { requiredStringParam } from "@/router/searchParams";

type WmsRasterServiceEditSearch = {
    pyramidId: string;
    datasheetName: string;
};

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/service/wms-raster/$offeringId/modification")({
    validateSearch: (search: { pyramidId: string; datasheetName: string } & SearchSchemaInput): WmsRasterServiceEditSearch => ({
        pyramidId: requiredStringParam(search.pyramidId, "pyramidId"),
        datasheetName: requiredStringParam(search.datasheetName, "datasheetName"),
    }),
    component: WmsRasterServiceEditRoute,
});

function WmsRasterServiceEditRoute() {
    const { datastoreId, offeringId } = Route.useParams();
    const { pyramidId, datasheetName } = Route.useSearch();
    return <PyramidRasterWmsRasterServiceForm datastoreId={datastoreId} pyramidId={pyramidId} datasheetName={datasheetName} offeringId={offeringId} />;
}

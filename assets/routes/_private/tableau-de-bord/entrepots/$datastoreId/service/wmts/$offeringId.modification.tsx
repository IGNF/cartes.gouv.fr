import { createFileRoute, SearchSchemaInput } from "@tanstack/react-router";

import PyramidRasterWmtsServiceForm from "@/entrepot/pages/service/wms-raster-wmts/PyramidRasterWmtsServiceForm/PyramidRasterWmtsServiceForm";
import { requiredStringParam } from "@/router/searchParams";

type WmtsServiceEditSearch = {
    pyramidId: string;
    datasheetName: string;
};

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/service/wmts/$offeringId/modification")({
    validateSearch: (search: { pyramidId: string; datasheetName: string } & SearchSchemaInput): WmtsServiceEditSearch => ({
        pyramidId: requiredStringParam(search.pyramidId, "pyramidId"),
        datasheetName: requiredStringParam(search.datasheetName, "datasheetName"),
    }),
    component: WmtsServiceEditRoute,
});

function WmtsServiceEditRoute() {
    const { datastoreId, offeringId } = Route.useParams();
    const { pyramidId, datasheetName } = Route.useSearch();
    return <PyramidRasterWmtsServiceForm datastoreId={datastoreId} pyramidId={pyramidId} datasheetName={datasheetName} offeringId={offeringId} />;
}

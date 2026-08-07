import { createFileRoute, SearchSchemaInput } from "@tanstack/react-router";

import PyramidRasterWmtsServiceForm from "@/entrepot/pages/service/wms-raster-wmts/PyramidRasterWmtsServiceForm/PyramidRasterWmtsServiceForm";
import { requiredStringParam } from "@/router/searchParams";

type WmtsServiceNewSearch = {
    pyramidId: string;
    datasheetName: string;
};

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/service/wmts/ajout")({
    validateSearch: (search: { pyramidId: string; datasheetName: string } & SearchSchemaInput): WmtsServiceNewSearch => ({
        pyramidId: requiredStringParam(search.pyramidId, "pyramidId"),
        datasheetName: requiredStringParam(search.datasheetName, "datasheetName"),
    }),
    component: WmtsServiceNewRoute,
});

function WmtsServiceNewRoute() {
    const { datastoreId } = Route.useParams();
    const { pyramidId, datasheetName } = Route.useSearch();
    return <PyramidRasterWmtsServiceForm datastoreId={datastoreId} pyramidId={pyramidId} datasheetName={datasheetName} />;
}

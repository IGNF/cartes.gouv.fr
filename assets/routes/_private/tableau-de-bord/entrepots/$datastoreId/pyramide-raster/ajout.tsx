import { createFileRoute, SearchSchemaInput } from "@tanstack/react-router";

import PyramidRasterGenerateForm from "@/entrepot/pages/service/wms-raster-wmts/PyramidRasterGenerateForm/PyramidRasterGenerateForm";
import { requiredStringParam } from "@/router/searchParams";

type PyramidRasterGenerateSearch = {
    offeringId: string;
    datasheetName: string;
};

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/pyramide-raster/ajout")({
    validateSearch: (search: { offeringId: string; datasheetName: string } & SearchSchemaInput): PyramidRasterGenerateSearch => ({
        offeringId: requiredStringParam(search.offeringId, "offeringId"),
        datasheetName: requiredStringParam(search.datasheetName, "datasheetName"),
    }),
    component: PyramidRasterGenerateRoute,
});

function PyramidRasterGenerateRoute() {
    const { datastoreId } = Route.useParams();
    const { offeringId, datasheetName } = Route.useSearch();
    return <PyramidRasterGenerateForm datastoreId={datastoreId} offeringId={offeringId} datasheetName={datasheetName} />;
}

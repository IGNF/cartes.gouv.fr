import { createFileRoute, SearchSchemaInput } from "@tanstack/react-router";

import PyramidRasterWmtsServiceForm from "@/entrepot/pages/service/wms-raster-wmts/PyramidRasterWmtsServiceForm/PyramidRasterWmtsServiceForm";
import { requiredStringParam } from "@/router/searchParams";

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/service/wmts/ajout")({
    validateSearch: (search: { pyramidId: string; datasheetName: string } & SearchSchemaInput): { pyramidId: string; datasheetName: string } => ({
        pyramidId: requiredStringParam(search.pyramidId, "pyramidId"),
        datasheetName: requiredStringParam(search.datasheetName, "datasheetName"),
    }),
    staticData: { matomoLabel: "Publier un service WMTS" },
    component: RouteComponent,
});

function RouteComponent() {
    const params = Route.useParams();
    const search = Route.useSearch();
    return <PyramidRasterWmtsServiceForm datastoreId={params.datastoreId} pyramidId={search.pyramidId} datasheetName={search.datasheetName} />;
}

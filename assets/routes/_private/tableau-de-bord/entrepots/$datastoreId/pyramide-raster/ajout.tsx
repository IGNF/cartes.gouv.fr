import { createFileRoute, SearchSchemaInput } from "@tanstack/react-router";

import PyramidRasterGenerateForm from "@/entrepot/pages/service/wms-raster-wmts/PyramidRasterGenerateForm/PyramidRasterGenerateForm";
import { requiredStringParam } from "@/router/searchParams";

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/pyramide-raster/ajout")({
    validateSearch: (search: { offeringId: string; datasheetName: string } & SearchSchemaInput): { offeringId: string; datasheetName: string } => ({
        offeringId: requiredStringParam(search.offeringId, "offeringId"),
        datasheetName: requiredStringParam(search.datasheetName, "datasheetName"),
    }),
    staticData: { matomoLabel: "Générer une pyramide de tuiles raster" },
    component: RouteComponent,
});

function RouteComponent() {
    const params = Route.useParams();
    const search = Route.useSearch();
    return <PyramidRasterGenerateForm datastoreId={params.datastoreId} offeringId={search.offeringId} datasheetName={search.datasheetName} />;
}

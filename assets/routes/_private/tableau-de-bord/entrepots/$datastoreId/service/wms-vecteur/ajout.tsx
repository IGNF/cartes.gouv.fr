import { createFileRoute, SearchSchemaInput } from "@tanstack/react-router";

import WmsVectorServiceForm from "@/entrepot/pages/service/wms-vector/WmsVectorServiceForm";
import { requiredStringParam } from "@/router/searchParams";

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/service/wms-vecteur/ajout")({
    validateSearch: (search: { vectorDbId: string; datasheetName: string } & SearchSchemaInput): { vectorDbId: string; datasheetName: string } => ({
        vectorDbId: requiredStringParam(search.vectorDbId, "vectorDbId"),
        datasheetName: requiredStringParam(search.datasheetName, "datasheetName"),
    }),
    staticData: { matomoLabel: "Publier un service WMS-Vecteur" },
    component: RouteComponent,
});

function RouteComponent() {
    const params = Route.useParams();
    const search = Route.useSearch();
    return <WmsVectorServiceForm datastoreId={params.datastoreId} vectorDbId={search.vectorDbId} />;
}

import { createFileRoute, SearchSchemaInput } from "@tanstack/react-router";

import WfsServiceForm from "@/entrepot/pages/service/wfs/WfsServiceForm";
import { requiredStringParam } from "@/router/searchParams";

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/service/wfs/ajout")({
    validateSearch: (search: { vectorDbId: string; datasheetName: string } & SearchSchemaInput): { vectorDbId: string; datasheetName: string } => ({
        vectorDbId: requiredStringParam(search.vectorDbId, "vectorDbId"),
        datasheetName: requiredStringParam(search.datasheetName, "datasheetName"),
    }),
    staticData: { matomoLabel: "Publier un service WFS" },
    component: RouteComponent,
});

function RouteComponent() {
    const params = Route.useParams();
    const search = Route.useSearch();
    return <WfsServiceForm datastoreId={params.datastoreId} vectorDbId={search.vectorDbId} />;
}

import { createFileRoute, SearchSchemaInput } from "@tanstack/react-router";

import WfsServiceForm from "@/entrepot/pages/service/wfs/WfsServiceForm";
import { requiredStringParam } from "@/router/searchParams";

type WfsServiceNewSearch = {
    vectorDbId: string;
    datasheetName: string;
};

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/service/wfs/ajout")({
    validateSearch: (search: { vectorDbId: string; datasheetName: string } & SearchSchemaInput): WfsServiceNewSearch => ({
        vectorDbId: requiredStringParam(search.vectorDbId, "vectorDbId"),
        datasheetName: requiredStringParam(search.datasheetName, "datasheetName"),
    }),
    component: WfsServiceNewRoute,
});

function WfsServiceNewRoute() {
    const { datastoreId } = Route.useParams();
    const { vectorDbId } = Route.useSearch();
    return <WfsServiceForm datastoreId={datastoreId} vectorDbId={vectorDbId} />;
}

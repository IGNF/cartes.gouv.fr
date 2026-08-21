import { createFileRoute, SearchSchemaInput } from "@tanstack/react-router";

import PyramidVectorTmsServiceForm from "@/entrepot/pages/service/tms/PyramidVectorTmsServiceForm/PyramidVectorTmsServiceForm";
import { requiredStringParam } from "@/router/searchParams";

type TmsServiceNewSearch = {
    pyramidId: string;
    datasheetName: string;
};

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/service/tms/ajout")({
    validateSearch: (search: { pyramidId: string; datasheetName: string } & SearchSchemaInput): TmsServiceNewSearch => ({
        pyramidId: requiredStringParam(search.pyramidId, "pyramidId"),
        datasheetName: requiredStringParam(search.datasheetName, "datasheetName"),
    }),
    component: TmsServiceNewRoute,
});

function TmsServiceNewRoute() {
    const { datastoreId } = Route.useParams();
    const { pyramidId } = Route.useSearch();
    return <PyramidVectorTmsServiceForm datastoreId={datastoreId} pyramidId={pyramidId} />;
}

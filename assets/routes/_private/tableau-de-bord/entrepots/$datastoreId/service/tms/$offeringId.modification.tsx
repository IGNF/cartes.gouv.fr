import { createFileRoute, SearchSchemaInput } from "@tanstack/react-router";

import PyramidVectorTmsServiceForm from "@/entrepot/pages/service/tms/PyramidVectorTmsServiceForm/PyramidVectorTmsServiceForm";
import { requiredStringParam } from "@/router/searchParams";

type TmsServiceEditSearch = {
    pyramidId: string;
    datasheetName: string;
};

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/service/tms/$offeringId/modification")({
    validateSearch: (search: { pyramidId: string; datasheetName: string } & SearchSchemaInput): TmsServiceEditSearch => ({
        pyramidId: requiredStringParam(search.pyramidId, "pyramidId"),
        datasheetName: requiredStringParam(search.datasheetName, "datasheetName"),
    }),
    component: TmsServiceEditRoute,
});

function TmsServiceEditRoute() {
    const { datastoreId, offeringId } = Route.useParams();
    const { pyramidId } = Route.useSearch();
    return <PyramidVectorTmsServiceForm datastoreId={datastoreId} pyramidId={pyramidId} offeringId={offeringId} />;
}

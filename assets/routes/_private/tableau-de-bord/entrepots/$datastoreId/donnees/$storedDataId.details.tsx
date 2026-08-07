import { createFileRoute, SearchSchemaInput } from "@tanstack/react-router";

import StoredDataDetails from "@/entrepot/pages/data_details/StoredDataDetails";
import { optionalStringParam } from "@/router/searchParams";

type StoredDataDetailsSearch = {
    datasheetName?: string;
};

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/donnees/$storedDataId/details")({
    validateSearch: (search: StoredDataDetailsSearch & SearchSchemaInput): StoredDataDetailsSearch => ({
        datasheetName: optionalStringParam(search.datasheetName),
    }),
    component: StoredDataDetailsRoute,
});

function StoredDataDetailsRoute() {
    const { datastoreId, storedDataId } = Route.useParams();
    return <StoredDataDetails datastoreId={datastoreId} storedDataId={storedDataId} />;
}

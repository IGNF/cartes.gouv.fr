import { createFileRoute, SearchSchemaInput } from "@tanstack/react-router";

import StoredDataDetails from "@/entrepot/pages/data_details/StoredDataDetails";
import { stringParam } from "@/router/searchParams";

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/donnees/$storedDataId/details")({
    validateSearch: (search: { datasheetName?: string } & SearchSchemaInput): { datasheetName?: string } => ({
        datasheetName: stringParam(search.datasheetName),
    }),
    staticData: { matomoLabel: "Détails de donnée stockée" },
    component: RouteComponent,
});

function RouteComponent() {
    const { datastoreId, storedDataId } = Route.useParams();
    return <StoredDataDetails datastoreId={datastoreId} storedDataId={storedDataId} />;
}

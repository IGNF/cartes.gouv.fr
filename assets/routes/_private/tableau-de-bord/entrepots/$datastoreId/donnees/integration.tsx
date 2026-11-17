import { createFileRoute, SearchSchemaInput } from "@tanstack/react-router";

import DatasheetUploadIntegrationPage from "@/entrepot/pages/datasheet/DatasheetNew/DatasheetUploadIntegration/DatasheetUploadIntegrationPage";
import { requiredStringParam, stringParam } from "@/router/searchParams";

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/donnees/integration")({
    validateSearch: (search: { uploadId: string; datasheetName?: string } & SearchSchemaInput): { uploadId: string; datasheetName?: string } => ({
        uploadId: requiredStringParam(search.uploadId, "uploadId"),
        datasheetName: stringParam(search.datasheetName),
    }),
    staticData: { matomoLabel: "Données intégration" },
    component: RouteComponent,
});

function RouteComponent() {
    const params = Route.useParams();
    const search = Route.useSearch();
    return <DatasheetUploadIntegrationPage datastoreId={params.datastoreId} uploadId={search.uploadId} datasheetName={search.datasheetName} />;
}

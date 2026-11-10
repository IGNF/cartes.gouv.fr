import { createFileRoute, SearchSchemaInput } from "@tanstack/react-router";

import DatasheetUploadIntegrationPage from "@/entrepot/pages/datasheet/DatasheetNew/DatasheetUploadIntegration/DatasheetUploadIntegrationPage";
import { enumParam, requiredStringParam, stringParam } from "@/router/searchParams";

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/donnees/integration")({
    validateSearch: (
        search: { uploadId: string; datasheetName?: string; vue?: "nouvelle" } & SearchSchemaInput
    ): { uploadId: string; datasheetName?: string; vue?: "nouvelle" } => ({
        uploadId: requiredStringParam(search.uploadId, "uploadId"),
        datasheetName: stringParam(search.datasheetName),
        // fiche de retour : nouvelle vue (refonte) ou ancienne
        vue: enumParam(search.vue, ["nouvelle"] as const),
    }),
    staticData: { matomoLabel: "Données intégration" },
    component: RouteComponent,
});

function RouteComponent() {
    const params = Route.useParams();
    const search = Route.useSearch();
    return (
        <DatasheetUploadIntegrationPage
            datastoreId={params.datastoreId}
            uploadId={search.uploadId}
            datasheetName={search.datasheetName}
            datasheetView={search.vue}
        />
    );
}

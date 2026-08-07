import { createFileRoute, SearchSchemaInput } from "@tanstack/react-router";

import DatasheetUploadIntegrationPage from "@/entrepot/pages/datasheet/DatasheetNew/DatasheetUploadIntegration/DatasheetUploadIntegrationPage";
import { optionalStringParam, requiredStringParam } from "@/router/searchParams";

type UploadIntegrationSearch = {
    uploadId: string;
    datasheetName?: string;
};

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/donnees/integration")({
    validateSearch: (search: { uploadId: string; datasheetName?: string } & SearchSchemaInput): UploadIntegrationSearch => ({
        uploadId: requiredStringParam(search.uploadId, "uploadId"),
        datasheetName: optionalStringParam(search.datasheetName),
    }),
    component: UploadIntegrationRoute,
});

function UploadIntegrationRoute() {
    const { datastoreId } = Route.useParams();
    const { uploadId, datasheetName } = Route.useSearch();
    return <DatasheetUploadIntegrationPage datastoreId={datastoreId} uploadId={uploadId} datasheetName={datasheetName} />;
}

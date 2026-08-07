import { createFileRoute, SearchSchemaInput } from "@tanstack/react-router";

import DatasheetUploadForm from "@/entrepot/pages/datasheet/DatasheetNew/DatasheetUploadForm/DatasheetUploadForm";
import { optionalStringParam } from "@/router/searchParams";

type DatasheetUploadSearch = {
    datasheetName?: string;
};

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/donnees/televersement")({
    validateSearch: (search: DatasheetUploadSearch & SearchSchemaInput): DatasheetUploadSearch => ({
        datasheetName: optionalStringParam(search.datasheetName),
    }),
    component: DatasheetUploadRoute,
});

function DatasheetUploadRoute() {
    const { datastoreId } = Route.useParams();
    return <DatasheetUploadForm datastoreId={datastoreId} />;
}

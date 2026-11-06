import { createFileRoute, SearchSchemaInput } from "@tanstack/react-router";

import DatasheetUploadForm from "@/entrepot/pages/datasheet/DatasheetNew/DatasheetUploadForm/DatasheetUploadForm";
import { stringParam } from "@/router/searchParams";

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/donnees/televersement")({
    validateSearch: (search: { datasheetName?: string } & SearchSchemaInput): { datasheetName?: string } => ({
        datasheetName: stringParam(search.datasheetName),
    }),
    staticData: { matomoLabel: "Créer une fiche de données" },
    component: RouteComponent,
});

function RouteComponent() {
    const { datastoreId } = Route.useParams();
    return <DatasheetUploadForm datastoreId={datastoreId} />;
}

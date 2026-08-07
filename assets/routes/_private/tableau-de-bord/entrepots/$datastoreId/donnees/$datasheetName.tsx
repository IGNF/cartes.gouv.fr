import { createFileRoute, SearchSchemaInput } from "@tanstack/react-router";

import DatasheetView from "@/entrepot/pages/datasheet/DatasheetView/DatasheetView/DatasheetView";
import { stringParam } from "@/router/searchParams";

type DatasheetViewSearch = {
    activeTab: string;
};

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/donnees/$datasheetName")({
    validateSearch: (search: { activeTab?: string } & SearchSchemaInput): DatasheetViewSearch => ({
        activeTab: stringParam(search.activeTab, "metadata"),
    }),
    component: DatasheetViewRoute,
});

function DatasheetViewRoute() {
    const { datastoreId, datasheetName } = Route.useParams();
    return <DatasheetView datastoreId={datastoreId} datasheetName={datasheetName} />;
}

import { createFileRoute, SearchSchemaInput } from "@tanstack/react-router";

import { DatasheetViewActiveTabEnum } from "@/entrepot/pages/datasheet/DatasheetView/DatasheetView/types";
import DatasheetView from "@/entrepot/pages/datasheet/DatasheetView/DatasheetView/DatasheetView";
import { enumParam } from "@/router/searchParams";

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/donnees/$datasheetName")({
    validateSearch: (search: { activeTab?: `${DatasheetViewActiveTabEnum}` } & SearchSchemaInput): { activeTab: DatasheetViewActiveTabEnum } => ({
        activeTab: enumParam(search.activeTab, Object.values(DatasheetViewActiveTabEnum)) ?? DatasheetViewActiveTabEnum.Metadata,
    }),
    staticData: { matomoLabel: "Fiche de données" },
    component: RouteComponent,
});

function RouteComponent() {
    const { datastoreId, datasheetName } = Route.useParams();
    return <DatasheetView datastoreId={datastoreId} datasheetName={datasheetName} />;
}

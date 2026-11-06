import { createFileRoute, SearchSchemaInput, stripSearchParams } from "@tanstack/react-router";

import { DatasheetViewActiveTabEnum } from "@/entrepot/pages/datasheet/DatasheetView/DatasheetView/DatasheetView";
import DatasheetView from "@/entrepot/pages/datasheet/DatasheetView/DatasheetView/DatasheetView";
import { enumParam } from "@/router/searchParams";

// valeurs par défaut absentes de l’URL, comme avant la bascule
const defaults = { activeTab: DatasheetViewActiveTabEnum.Metadata } as const;

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/donnees/$datasheetName")({
    validateSearch: (search: { activeTab?: `${DatasheetViewActiveTabEnum}` } & SearchSchemaInput): { activeTab: DatasheetViewActiveTabEnum } => ({
        activeTab: enumParam(search.activeTab, Object.values(DatasheetViewActiveTabEnum)) ?? defaults.activeTab,
    }),
    search: { middlewares: [stripSearchParams(defaults)] },
    staticData: { matomoLabel: "Fiche de données" },
    component: RouteComponent,
});

function RouteComponent() {
    const { datastoreId, datasheetName } = Route.useParams();
    return <DatasheetView datastoreId={datastoreId} datasheetName={datasheetName} />;
}

import { createFileRoute, SearchSchemaInput } from "@tanstack/react-router";

import DatasheetViewNext, { DATASHEET_VIEW_NEXT_TABS } from "@/entrepot/pages/datasheet/DatasheetView/DatasheetView/DatasheetViewNext";
import { DatasheetViewActiveTabEnum } from "@/entrepot/pages/datasheet/DatasheetView/DatasheetView/types";
import { enumParam } from "@/router/searchParams";

// shortcut: page sans lien jusqu’au ticket 06 de la refonte, qui remplace l’ancienne fiche
export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/donnees/$datasheetName/nouvelle-vue")({
    validateSearch: (search: { activeTab?: `${DatasheetViewActiveTabEnum}` } & SearchSchemaInput): { activeTab: DatasheetViewActiveTabEnum } => ({
        activeTab: enumParam(search.activeTab, DATASHEET_VIEW_NEXT_TABS) ?? DatasheetViewActiveTabEnum.Description,
    }),
    staticData: { matomoLabel: "Fiche de données (nouvelle vue)" },
    component: RouteComponent,
});

function RouteComponent() {
    const { datastoreId, datasheetName } = Route.useParams();
    const { activeTab } = Route.useSearch();
    return <DatasheetViewNext datastoreId={datastoreId} datasheetName={datasheetName} activeTab={activeTab} />;
}

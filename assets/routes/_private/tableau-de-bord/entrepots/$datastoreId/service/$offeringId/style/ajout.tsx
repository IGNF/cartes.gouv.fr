import { createFileRoute, SearchSchemaInput } from "@tanstack/react-router";

import StyleAddModifyForm from "@/entrepot/pages/service/view/Style/StyleAddModifyForm";
import { requiredStringParam } from "@/router/searchParams";

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/service/$offeringId/style/ajout")({
    validateSearch: (search: { datasheetName: string } & SearchSchemaInput): { datasheetName: string } => ({
        datasheetName: requiredStringParam(search.datasheetName, "datasheetName"),
    }),
    staticData: { matomoLabel: "Ajouter un style" },
    component: RouteComponent,
});

function RouteComponent() {
    const params = Route.useParams();
    const search = Route.useSearch();
    return <StyleAddModifyForm datastoreId={params.datastoreId} offeringId={params.offeringId} datasheetName={search.datasheetName} />;
}

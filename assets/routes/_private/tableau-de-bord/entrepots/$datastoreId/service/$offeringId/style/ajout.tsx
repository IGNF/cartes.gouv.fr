import { createFileRoute, SearchSchemaInput } from "@tanstack/react-router";

import StyleAddModifyForm, { STYLE_FORM_RETURN_PAGES, type StyleFormReturnPage } from "@/entrepot/pages/service/view/Style/StyleAddModifyForm";
import { enumParam, requiredStringParam } from "@/router/searchParams";

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/service/$offeringId/style/ajout")({
    validateSearch: (
        search: { datasheetName: string; returnTo?: StyleFormReturnPage } & SearchSchemaInput
    ): { datasheetName: string; returnTo?: StyleFormReturnPage } => ({
        datasheetName: requiredStringParam(search.datasheetName, "datasheetName"),
        returnTo: enumParam(search.returnTo, STYLE_FORM_RETURN_PAGES),
    }),
    staticData: { matomoLabel: "Ajouter un style" },
    component: RouteComponent,
});

function RouteComponent() {
    const params = Route.useParams();
    const search = Route.useSearch();
    return (
        <StyleAddModifyForm datastoreId={params.datastoreId} offeringId={params.offeringId} datasheetName={search.datasheetName} returnTo={search.returnTo} />
    );
}

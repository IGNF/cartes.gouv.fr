import { createFileRoute, SearchSchemaInput } from "@tanstack/react-router";

import StyleAddModifyForm from "@/entrepot/pages/service/view/Style/StyleAddModifyForm";
import { requiredStringParam } from "@/router/searchParams";

type StyleEditSearch = {
    datasheetName: string;
};

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/service/$offeringId/style/$styleTechnicalName/modification")({
    validateSearch: (search: { datasheetName: string } & SearchSchemaInput): StyleEditSearch => ({
        datasheetName: requiredStringParam(search.datasheetName, "datasheetName"),
    }),
    component: StyleEditRoute,
});

function StyleEditRoute() {
    const { datastoreId, offeringId, styleTechnicalName } = Route.useParams();
    const { datasheetName } = Route.useSearch();
    return <StyleAddModifyForm datastoreId={datastoreId} offeringId={offeringId} datasheetName={datasheetName} styleTechnicalName={styleTechnicalName} />;
}

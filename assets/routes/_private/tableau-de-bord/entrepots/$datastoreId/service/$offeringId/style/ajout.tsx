import { createFileRoute, SearchSchemaInput } from "@tanstack/react-router";

import StyleAddModifyForm from "@/entrepot/pages/service/view/Style/StyleAddModifyForm";
import { requiredStringParam } from "@/router/searchParams";

type StyleAddSearch = {
    datasheetName: string;
};

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/service/$offeringId/style/ajout")({
    validateSearch: (search: { datasheetName: string } & SearchSchemaInput): StyleAddSearch => ({
        datasheetName: requiredStringParam(search.datasheetName, "datasheetName"),
    }),
    component: StyleAddRoute,
});

function StyleAddRoute() {
    const { datastoreId, offeringId } = Route.useParams();
    const { datasheetName } = Route.useSearch();
    return <StyleAddModifyForm datastoreId={datastoreId} offeringId={offeringId} datasheetName={datasheetName} />;
}

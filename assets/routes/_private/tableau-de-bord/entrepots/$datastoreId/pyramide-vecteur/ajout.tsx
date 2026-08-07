import { createFileRoute, SearchSchemaInput } from "@tanstack/react-router";

import PyramidVectorGenerateForm from "@/entrepot/pages/service/tms/PyramidVectorGenerateForm/PyramidVectorGenerateForm";
import { requiredStringParam } from "@/router/searchParams";

type PyramidVectorGenerateSearch = {
    vectorDbId: string;
    technicalName: string;
    datasheetName: string;
};

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/pyramide-vecteur/ajout")({
    validateSearch: (search: { vectorDbId: string; technicalName: string; datasheetName: string } & SearchSchemaInput): PyramidVectorGenerateSearch => ({
        vectorDbId: requiredStringParam(search.vectorDbId, "vectorDbId"),
        technicalName: requiredStringParam(search.technicalName, "technicalName"),
        datasheetName: requiredStringParam(search.datasheetName, "datasheetName"),
    }),
    component: PyramidVectorGenerateRoute,
});

function PyramidVectorGenerateRoute() {
    const { datastoreId } = Route.useParams();
    const { vectorDbId, technicalName } = Route.useSearch();
    return <PyramidVectorGenerateForm datastoreId={datastoreId} vectorDbId={vectorDbId} technicalName={technicalName} />;
}

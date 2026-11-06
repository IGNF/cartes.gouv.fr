import { createFileRoute, SearchSchemaInput } from "@tanstack/react-router";

import PyramidVectorGenerateForm from "@/entrepot/pages/service/tms/PyramidVectorGenerateForm/PyramidVectorGenerateForm";
import { requiredStringParam } from "@/router/searchParams";

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/pyramide-vecteur/ajout")({
    validateSearch: (
        search: { vectorDbId: string; technicalName: string; datasheetName: string } & SearchSchemaInput
    ): { vectorDbId: string; technicalName: string; datasheetName: string } => ({
        vectorDbId: requiredStringParam(search.vectorDbId, "vectorDbId"),
        technicalName: requiredStringParam(search.technicalName, "technicalName"),
        datasheetName: requiredStringParam(search.datasheetName, "datasheetName"),
    }),
    staticData: { matomoLabel: "Générer une pyramide de tuiles vectorielles" },
    component: RouteComponent,
});

function RouteComponent() {
    const params = Route.useParams();
    const search = Route.useSearch();
    return <PyramidVectorGenerateForm datastoreId={params.datastoreId} vectorDbId={search.vectorDbId} technicalName={search.technicalName} />;
}

import { createFileRoute, SearchSchemaInput } from "@tanstack/react-router";

import { CommunityMemberDtoRightsEnum } from "@/@types/entrepot";
import PyramidVectorGenerateForm from "@/entrepot/pages/service/tms/PyramidVectorGenerateForm/PyramidVectorGenerateForm";
import { requiredStringParam, stringParam } from "@/router/searchParams";

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/pyramide-vecteur/ajout")({
    // vectorDbId : base vecteur présélectionnée
    validateSearch: (search: { vectorDbId?: string; datasheetName: string } & SearchSchemaInput): { vectorDbId?: string; datasheetName: string } => ({
        vectorDbId: stringParam(search.vectorDbId),
        datasheetName: requiredStringParam(search.datasheetName, "datasheetName"),
    }),
    staticData: { matomoLabel: "Générer une pyramide de tuiles vectorielles", requiredRights: [CommunityMemberDtoRightsEnum.PROCESSING] },
    component: RouteComponent,
});

function RouteComponent() {
    const params = Route.useParams();
    const search = Route.useSearch();
    return <PyramidVectorGenerateForm datastoreId={params.datastoreId} datasheetName={search.datasheetName} vectorDbId={search.vectorDbId} />;
}

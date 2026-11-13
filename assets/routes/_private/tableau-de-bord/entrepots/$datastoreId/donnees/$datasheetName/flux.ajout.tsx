import { createFileRoute, SearchSchemaInput } from "@tanstack/react-router";

import { CommunityMemberDtoRightsEnum } from "@/@types/entrepot";
import ServiceAddPage from "@/entrepot/pages/datasheet/ServiceAdd/ServiceAddPage";
import { SERVICE_TYPES, type ServiceType } from "@/entrepot/pages/datasheet/ServiceForm/serviceFormSchema";
import { enumParam } from "@/router/searchParams";

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/donnees/$datasheetName/flux/ajout")({
    // type inconnu ou absent : WFS
    validateSearch: (search: { type?: ServiceType } & SearchSchemaInput): { type: ServiceType } => ({
        type: enumParam(search.type, SERVICE_TYPES) ?? "wfs",
    }),
    // publication (BROADCAST) avec vignette et logo déposés en annexes (ANNEX)
    staticData: { matomoLabel: "Ajouter un flux", requiredRights: [CommunityMemberDtoRightsEnum.BROADCAST, CommunityMemberDtoRightsEnum.ANNEX] },
    component: RouteComponent,
});

function RouteComponent() {
    const { datastoreId, datasheetName } = Route.useParams();
    const { type } = Route.useSearch();
    return <ServiceAddPage datastoreId={datastoreId} datasheetName={datasheetName} type={type} />;
}

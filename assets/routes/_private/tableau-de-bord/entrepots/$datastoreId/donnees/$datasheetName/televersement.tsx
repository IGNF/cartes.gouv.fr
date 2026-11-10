import { createFileRoute } from "@tanstack/react-router";

import { CommunityMemberDtoRightsEnum } from "@/@types/entrepot";
import DatasetAddPage from "@/entrepot/pages/datasheet/DatasetAdd/DatasetAddPage";

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/donnees/$datasheetName/televersement")({
    // déclaration de livraison (UPLOAD) puis intégration en base (PROCESSING)
    staticData: { matomoLabel: "Ajouter une donnée", requiredRights: [CommunityMemberDtoRightsEnum.UPLOAD, CommunityMemberDtoRightsEnum.PROCESSING] },
    component: RouteComponent,
});

function RouteComponent() {
    const { datastoreId, datasheetName } = Route.useParams();
    return <DatasetAddPage datastoreId={datastoreId} datasheetName={datasheetName} />;
}

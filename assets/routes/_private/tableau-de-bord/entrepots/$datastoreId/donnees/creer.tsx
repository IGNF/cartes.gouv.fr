import { createFileRoute } from "@tanstack/react-router";

import { CommunityMemberDtoRightsEnum } from "@/@types/entrepot";
import DatasheetCreate from "@/entrepot/pages/datasheet/DatasheetCreate/DatasheetCreate";

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/donnees/creer")({
    // fiche de métadonnées = publication (BROADCAST), vignette = annexe (ANNEX)
    staticData: { matomoLabel: "Créer une fiche de données", requiredRights: [CommunityMemberDtoRightsEnum.BROADCAST, CommunityMemberDtoRightsEnum.ANNEX] },
    component: RouteComponent,
});

function RouteComponent() {
    const { datastoreId } = Route.useParams();
    return <DatasheetCreate datastoreId={datastoreId} />;
}

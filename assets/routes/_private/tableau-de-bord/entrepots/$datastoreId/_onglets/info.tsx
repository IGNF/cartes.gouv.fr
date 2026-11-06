import { createFileRoute } from "@tanstack/react-router";

import CommunityLayout from "@/components/Layout/CommunityLayout";
import { useDatastore } from "@/contexts/datastore";
import CommunityInfo from "@/entrepot/pages/communities/CommunityInfo/CommunityInfo";

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/_onglets/info")({
    staticData: { matomoLabel: "Fiche communauté" },
    component: RouteComponent,
});

function RouteComponent() {
    const { datastore } = useDatastore();
    return (
        <CommunityLayout communityId={datastore.community._id}>
            <CommunityInfo />
        </CommunityLayout>
    );
}

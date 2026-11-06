import { createFileRoute, notFound } from "@tanstack/react-router";

import CommunityLayout from "@/components/Layout/CommunityLayout";
import Alerts from "@/entrepot/pages/config/Alerts";
import { configCommunityId } from "@/env";

export const Route = createFileRoute("/_private/configuration/alertes")({
    // communauté de configuration fournie par l’environnement ; l’appartenance est vérifiée par CommunityLayout
    beforeLoad: () => {
        if (!configCommunityId) throw notFound();
        return { configCommunityId };
    },
    staticData: { matomoLabel: "Configuration des alertes" },
    component: RouteComponent,
});

function RouteComponent() {
    const { configCommunityId } = Route.useRouteContext();
    return (
        <CommunityLayout communityId={configCommunityId}>
            <Alerts />
        </CommunityLayout>
    );
}

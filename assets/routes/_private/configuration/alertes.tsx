import { createFileRoute, notFound } from "@tanstack/react-router";

import { CartesUser } from "@/@types/app";
import CommunityLayout from "@/components/Layout/CommunityLayout";
import Alerts from "@/entrepot/pages/config/Alerts";
import { configCommunityId } from "@/env";
import useMembership from "@/hooks/useMembership";
import RQKeys from "@/modules/entrepot/RQKeys";
import { revalidateUser } from "@/modules/queryClient";
import { findMembership } from "@/utils/membership";

export const Route = createFileRoute("/_private/configuration/alertes")({
    // communauté de configuration fournie par l’environnement ; 404 miroir sans appartenance, droits vérifiés par CommunityLayout
    beforeLoad: ({ context }) => {
        if (!configCommunityId) throw notFound();
        const membership = findMembership(context.queryClient.getQueryData<CartesUser | null>(RQKeys.user_me()), { communityId: configCommunityId });
        if (!membership) {
            revalidateUser();
            throw notFound();
        }
        return { configCommunityId };
    },
    staticData: { matomoLabel: "Configuration des alertes" },
    component: RouteComponent,
});

function RouteComponent() {
    const { configCommunityId } = Route.useRouteContext();
    const datastoreId = useMembership({ communityId: configCommunityId })?.community?.datastore;
    if (!datastoreId) return null;
    return (
        <CommunityLayout communityId={configCommunityId}>
            <Alerts datastoreId={datastoreId} />
        </CommunityLayout>
    );
}

import { createFileRoute, notFound } from "@tanstack/react-router";

import { CartesUser } from "@/@types/app";
import CommunityGate from "@/components/Layout/CommunityGate";
import { configCommunityId } from "@/env";
import Alerts from "@/entrepot/pages/config/Alerts";
import RQKeys from "@/modules/entrepot/RQKeys";
import { revalidateUser } from "@/modules/queryClient";
import PageNotFound from "@/pages/error/PageNotFound";
import { findMembership } from "@/utils";

// Gate sur la communauté de configuration (id fourni par l'env, pas de param d'URL) : id absent ou non-membre → 404
export const Route = createFileRoute("/_private/configuration/alertes")({
    beforeLoad: ({ context }) => {
        if (!configCommunityId) {
            throw notFound();
        }
        const user = context.queryClient.getQueryData<CartesUser | null>(RQKeys.user_me());
        const membership = findMembership(user, { communityId: configCommunityId });
        // Deny-path : UNE revalidation throttlée de user_me avant 404 définitif
        if (!membership) {
            revalidateUser();
            throw notFound();
        }
        return { membership };
    },
    component: AlertsRoute,
});

function AlertsRoute() {
    // impossible après le gate, garde de type
    if (!configCommunityId) {
        return <PageNotFound />;
    }

    return (
        <CommunityGate communityId={configCommunityId}>
            <Alerts />
        </CommunityGate>
    );
}

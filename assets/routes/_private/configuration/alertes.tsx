import { createFileRoute, notFound } from "@tanstack/react-router";

import { CartesUser } from "@/@types/app";
import { configCommunityId } from "@/env";
import { datastoreAnnexeListQueryOptions } from "@/entrepot/hooks/queries/datastoreAnnexeListQueryOptions";
import Alerts from "@/entrepot/pages/config/Alerts";
import RQKeys from "@/entrepot/modules/RQKeys";
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
    loader: ({ context }) => {
        const datastoreId = context.membership.community?.datastore;
        if (datastoreId !== undefined) {
            void context.queryClient.prefetchQuery(datastoreAnnexeListQueryOptions(datastoreId));
        }
    },
    component: AlertsRoute,
    notFoundComponent: PageNotFound,
});

function AlertsRoute() {
    const { membership } = Route.useRouteContext();

    return <Alerts datastoreId={membership.community?.datastore} />;
}

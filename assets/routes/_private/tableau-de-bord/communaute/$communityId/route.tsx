import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";

import { CartesUser } from "@/@types/app";
import ResourceAccessGate from "@/components/Layout/ResourceAccessGate";
import { datastoreQueryOptions } from "@/hooks/queries/datastoreQueryOptions";
import RQKeys from "@/modules/entrepot/RQKeys";
import { revalidateUser } from "@/modules/queryClient";
import ApiErrorPage from "@/pages/error/ApiErrorPage";
import PageNotFound from "@/pages/error/PageNotFound";
import { findMembership } from "@/utils/membership";

export const Route = createFileRoute("/_private/tableau-de-bord/communaute/$communityId")({
    // 404 miroir : sans appartenance, la communauté est inexistante ou inaccessible ; lecture du cache, aucune requête
    beforeLoad: ({ context, params }) => {
        const membership = findMembership(context.queryClient.getQueryData<CartesUser | null>(RQKeys.user_me()), { communityId: params.communityId });
        if (!membership) {
            // une revalidation avant le 404 définitif : une appartenance récente ré-exécute ce gate
            revalidateUser();
            throw notFound();
        }
        return { membership };
    },
    loader: ({ context }) => {
        const datastoreId = context.membership.community?.datastore;
        if (datastoreId) void context.queryClient.query(datastoreQueryOptions(datastoreId)).catch(() => {});
    },
    component: CommunityRoute,
    errorComponent: ApiErrorPage,
    notFoundComponent: PageNotFound,
});

function CommunityRoute() {
    const { communityId } = Route.useParams();
    return (
        <ResourceAccessGate resource={{ communityId }}>
            <Outlet />
        </ResourceAccessGate>
    );
}

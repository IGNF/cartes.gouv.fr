import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";

import { CartesUser } from "@/@types/app";
import CommunityLayout from "@/components/Layout/CommunityLayout";
import RQKeys from "@/modules/entrepot/RQKeys";
import ApiErrorPage from "@/pages/error/ApiErrorPage";
import PageNotFound from "@/pages/error/PageNotFound";
import { findMembership } from "@/utils/membership";

export const Route = createFileRoute("/_private/tableau-de-bord/communaute/$communityId")({
    // 404 miroir : sans appartenance, la communauté est inexistante ou inaccessible ; lecture du cache, aucune requête
    beforeLoad: ({ context, params }) => {
        const membership = findMembership(context.queryClient.getQueryData<CartesUser | null>(RQKeys.user_me()), { communityId: params.communityId });
        if (!membership) {
            throw notFound();
        }
        return { membership };
    },
    component: CommunityRoute,
    errorComponent: ApiErrorPage,
    notFoundComponent: PageNotFound,
});

function CommunityRoute() {
    const { communityId } = Route.useParams();
    return (
        <CommunityLayout communityId={communityId}>
            <Outlet />
        </CommunityLayout>
    );
}

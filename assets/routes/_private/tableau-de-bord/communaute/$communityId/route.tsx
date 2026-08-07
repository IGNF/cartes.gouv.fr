import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";

import { CartesUser } from "@/@types/app";
import CommunityGate from "@/components/Layout/CommunityGate";
import RQKeys from "@/modules/entrepot/RQKeys";
import { revalidateUser } from "@/modules/queryClient";
import { findMembership } from "@/utils";

// Gate synchrone du sous-arbre communauté : user_me est bootstrappé dans le cache, aucun fetch (light-first)
export const Route = createFileRoute("/_private/tableau-de-bord/communaute/$communityId")({
    beforeLoad: ({ context, params }) => {
        const user = context.queryClient.getQueryData<CartesUser | null>(RQKeys.user_me());
        const membership = findMembership(user, { communityId: params.communityId });

        // 404 miroir : appartenance inconnue = communauté inexistante ou inaccessible.
        // Deny-path : UNE revalidation throttlée de user_me — si l'appartenance (ré)apparaît,
        // router.invalidate() ré-exécute ce gate et la page se rend.
        if (!membership) {
            revalidateUser();
            throw notFound();
        }
        return { membership };
    },
    component: CommunityLayoutRoute,
});

function CommunityLayoutRoute() {
    const { communityId } = Route.useParams();

    return (
        <CommunityGate communityId={communityId}>
            <Outlet />
        </CommunityGate>
    );
}

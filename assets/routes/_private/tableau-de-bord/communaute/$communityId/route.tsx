import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";

import { CartesUser } from "@/@types/app";
import { CommunityProvider } from "@/entrepot/contexts/community";
import { communityQueryOptions } from "@/entrepot/hooks/queries/communityQueryOptions";
import { datastoreQueryOptions } from "@/entrepot/hooks/queries/datastoreQueryOptions";
import useUserQuery from "@/hooks/queries/useUserQuery";
import useRequiredRights from "@/entrepot/hooks/useRequiredRights";
import RQKeys from "@/entrepot/modules/RQKeys";
import { revalidateUser } from "@/modules/queryClient";
import ApiErrorPage from "@/pages/error/ApiErrorPage";
import Forbidden from "@/pages/error/Forbidden";
import PageNotFound from "@/pages/error/PageNotFound";
import { findMembership, hasAccess } from "@/utils";

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
    loader: ({ context, params }) => {
        void context.queryClient.prefetchQuery(communityQueryOptions(params.communityId));

        // le datastore éventuel part en parallèle : son id vient de membership, pas de la réponse communauté
        const datastoreId = context.membership.community?.datastore;
        if (datastoreId !== undefined) {
            void context.queryClient.prefetchQuery(datastoreQueryOptions(datastoreId));
        }
    },
    component: CommunityLayoutRoute,
    errorComponent: ApiErrorPage,

    notFoundComponent: PageNotFound,
});

function CommunityLayoutRoute() {
    const { communityId } = Route.useParams();

    const { data: community } = useSuspenseQuery(communityQueryOptions(communityId));

    const { data: user } = useUserQuery();
    const requiredRights = useRequiredRights();

    return <CommunityProvider community={community}>{hasAccess(user, { communityId }, requiredRights) ? <Outlet /> : <Forbidden />}</CommunityProvider>;
}

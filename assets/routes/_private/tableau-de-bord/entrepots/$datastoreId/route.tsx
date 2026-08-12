import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";

import { CartesUser } from "@/@types/app";
import { datastoreQueryOptions } from "@/entrepot/hooks/queries/datastoreQueryOptions";
import useUserQuery from "@/hooks/queries/useUserQuery";
import useRequiredRights from "@/entrepot/hooks/useRequiredRights";
import RQKeys from "@/entrepot/modules/RQKeys";
import { revalidateUser } from "@/modules/queryClient";
import ApiErrorPage from "@/pages/error/ApiErrorPage";
import Forbidden from "@/pages/error/Forbidden";
import PageNotFound from "@/pages/error/PageNotFound";
import { findMembership, hasAccess } from "@/utils";

// Gate synchrone du sous-arbre datastore : user_me est bootstrappé dans le cache, aucun fetch (light-first)
export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId")({
    beforeLoad: ({ context, params }) => {
        const user = context.queryClient.getQueryData<CartesUser | null>(RQKeys.user_me());
        const membership = findMembership(user, { datastoreId: params.datastoreId });

        // 404 miroir : appartenance inconnue = entrepôt inexistant ou inaccessible.
        // Deny-path : UNE revalidation throttlée de user_me — si l'appartenance (ré)apparaît,
        // router.invalidate() ré-exécute ce gate et la page se rend.
        if (!membership) {
            revalidateUser();
            throw notFound();
        }
        return { membership };
    },
    loader: ({ context, params }) => {
        void context.queryClient.prefetchQuery(datastoreQueryOptions(params.datastoreId));
    },
    component: DatastoreLayoutRoute,
    errorComponent: ApiErrorPage,

    notFoundComponent: PageNotFound,
});

function DatastoreLayoutRoute() {
    const { datastoreId } = Route.useParams();

    const { data: user } = useUserQuery();
    const requiredRights = useRequiredRights();

    return hasAccess(user, { datastoreId }, requiredRights) ? <Outlet /> : <Forbidden />;
}

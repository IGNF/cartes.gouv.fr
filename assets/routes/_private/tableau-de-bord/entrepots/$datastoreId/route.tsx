import { useQuery } from "@tanstack/react-query";
import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";

import { CartesUser, Datastore } from "@/@types/app";
import LoadingText from "@/components/Utils/LoadingText";
import Main from "@/components/Layout/Main";
import { DatastoreProvider } from "@/contexts/datastore";
import { datastoreQueryOptions } from "@/hooks/queries/datastoreQueryOptions";
import useUserQuery from "@/hooks/queries/useUserQuery";
import useRequiredRights from "@/hooks/useRequiredRights";
import RQKeys from "@/modules/entrepot/RQKeys";
import { CartesApiException } from "@/modules/jsonFetch";
import Forbidden from "@/pages/error/Forbidden";
import PageNotFound from "@/pages/error/PageNotFound";
import UnexpectedError from "@/pages/error/UnexpectedError";
import { findMembership, hasAccess } from "@/utils";

// Gate synchrone du sous-arbre datastore : user_me est bootstrappé dans le cache, aucun fetch (light-first)
export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId")({
    beforeLoad: ({ context, params }) => {
        const user = context.queryClient.getQueryData<CartesUser | null>(RQKeys.user_me());
        const membership = findMembership(user, { datastoreId: params.datastoreId });

        // 404 miroir : appartenance inconnue = entrepôt inexistant ou inaccessible
        if (!membership) {
            throw notFound();
        }
        return { membership };
    },
    component: DatastoreLayoutRoute,
});

// Portage de DatastoreLayout (sans AppLayout, fourni par le layout _private)
function DatastoreLayoutRoute() {
    const { datastoreId } = Route.useParams();

    const { data, error, failureReason, isFetching, isPending, refetch, status } = useQuery<Datastore, CartesApiException>(datastoreQueryOptions(datastoreId));

    const { data: user } = useUserQuery();
    const requiredRights = useRequiredRights();

    if (isPending) {
        return (
            <Main>
                <LoadingText withSpinnerIcon />
            </Main>
        );
    }

    // 404 : ressource inexistante OU inaccessible (l'API Entrepôt répond 404 dans les deux cas, comportement miroir voulu)
    if (error?.code === 404 || failureReason?.code === 404) {
        return <PageNotFound />;
    }

    // toute autre erreur (500, réseau...) n'est PAS une 404
    if (error || !data) {
        return <UnexpectedError message={error?.message} onRetry={() => refetch()} />;
    }

    return (
        <DatastoreProvider datastore={data} isFetching={isFetching} status={status}>
            {hasAccess(user, { datastoreId }, requiredRights) ? <Outlet /> : <Forbidden />}
        </DatastoreProvider>
    );
}

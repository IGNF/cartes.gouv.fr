import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { createFileRoute, ErrorComponentProps, notFound, Outlet, useRouter } from "@tanstack/react-router";

import { CartesUser } from "@/@types/app";
import { datastoreQueryOptions } from "@/hooks/queries/datastoreQueryOptions";
import useUserQuery from "@/hooks/queries/useUserQuery";
import useRequiredRights from "@/hooks/useRequiredRights";
import RQKeys from "@/modules/entrepot/RQKeys";
import { CartesApiException } from "@/modules/jsonFetch";
import { revalidateUser } from "@/modules/queryClient";
import Forbidden from "@/pages/error/Forbidden";
import PageNotFound from "@/pages/error/PageNotFound";
import UnexpectedError from "@/pages/error/UnexpectedError";
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
        // préchauffe le DTO complet sans bloquer le rendu du shell ; les pages le consomment en useSuspenseQuery
        void context.queryClient.prefetchQuery(datastoreQueryOptions(params.datastoreId));
    },
    component: DatastoreLayoutRoute,
    errorComponent: DatastoreErrorComponent,
});

// Partition miroir-404 (portage de DatastoreLayout) : les erreurs des useSuspenseQuery des pages remontent ici
function DatastoreErrorComponent({ error }: ErrorComponentProps) {
    const router = useRouter();
    const { reset } = useQueryErrorResetBoundary();

    // 404 : ressource inexistante OU inaccessible (l'API Entrepôt répond 404 dans les deux cas, comportement miroir voulu)
    if ((error as Partial<CartesApiException>)?.code === 404) {
        return <PageNotFound />;
    }

    // toute autre erreur (500, réseau...) n'est PAS une 404
    return (
        <UnexpectedError
            message={error.message}
            onRetry={() => {
                reset();
                router.invalidate();
            }}
        />
    );
}

function DatastoreLayoutRoute() {
    const { datastoreId } = Route.useParams();

    const { data: user } = useUserQuery();
    const requiredRights = useRequiredRights();

    return hasAccess(user, { datastoreId }, requiredRights) ? <Outlet /> : <Forbidden />;
}

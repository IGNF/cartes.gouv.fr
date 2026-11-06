import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";

import { CartesUser } from "@/@types/app";
import DatastoreLayout from "@/components/Layout/DatastoreLayout";
import { datastoreQueryOptions } from "@/hooks/queries/datastoreQueryOptions";
import RQKeys from "@/modules/entrepot/RQKeys";
import { revalidateUser } from "@/modules/queryClient";
import ApiErrorPage from "@/pages/error/ApiErrorPage";
import PageNotFound from "@/pages/error/PageNotFound";
import { findMembership } from "@/utils/membership";

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId")({
    // 404 miroir : sans appartenance, l’entrepôt est inexistant ou inaccessible ; lecture du cache, aucune requête
    beforeLoad: ({ context, params }) => {
        const membership = findMembership(context.queryClient.getQueryData<CartesUser | null>(RQKeys.user_me()), { datastoreId: params.datastoreId });
        if (!membership) {
            // une revalidation avant le 404 définitif : une appartenance récente ré-exécute ce gate
            revalidateUser();
            throw notFound();
        }
        return { membership };
    },
    // lancé sans attente : les pages qui lisent le DTO le reçoivent par useSuspenseQuery, l’erreur reste dans le cache
    loader: ({ context, params }) => {
        void context.queryClient.query(datastoreQueryOptions(params.datastoreId)).catch(() => {});
    },
    component: DatastoreRoute,
    errorComponent: ApiErrorPage,
    notFoundComponent: PageNotFound,
});

function DatastoreRoute() {
    const { datastoreId } = Route.useParams();
    return (
        <DatastoreLayout datastoreId={datastoreId}>
            <Outlet />
        </DatastoreLayout>
    );
}

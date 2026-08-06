import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";

import { CartesUser } from "@/@types/app";
import RQKeys from "@/modules/entrepot/RQKeys";
import { findMembership } from "@/utils";

// SPIKE : gate synchrone dans beforeLoad — décision light-first, lecture du cache user_me bootstrappé
export const Route = createFileRoute("/tableau-de-bord/entrepots/$datastoreId")({
    beforeLoad: ({ context, params }) => {
        const user = context.queryClient.getQueryData<CartesUser | null>(RQKeys.user_me());
        const membership = findMembership(user, { datastoreId: params.datastoreId });
        if (!membership) {
            throw notFound();
        }
        // le membership résolu une fois est fourni à tout le sous-arbre via le contexte typé
        return { membership };
    },
    component: DatastoreLayoutSpike,
});

function DatastoreLayoutSpike() {
    const { membership } = Route.useRouteContext();

    return (
        <section>
            <h1>Entrepôt : {membership.community?.name}</h1>
            <p>Droits : {membership.rights?.join(", ") ?? "aucun"}</p>
            <Outlet />
        </section>
    );
}

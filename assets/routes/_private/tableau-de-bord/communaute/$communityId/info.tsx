import { createFileRoute, redirect } from "@tanstack/react-router";

// symétrique de l’onglet Info de l’entrepôt, qui est l’URL de référence ; sans entrepôt, fiche de la communauté
export const Route = createFileRoute("/_private/tableau-de-bord/communaute/$communityId/info")({
    beforeLoad: ({ context, params }) => {
        const datastoreId = context.membership.community?.datastore;
        if (datastoreId) {
            throw redirect({ to: "/tableau-de-bord/entrepots/$datastoreId/info", params: { datastoreId }, replace: true });
        }
        throw redirect({ to: "/tableau-de-bord/communaute/$communityId", params, replace: true });
    },
    staticData: { matomoLabel: "Fiche communauté" },
});

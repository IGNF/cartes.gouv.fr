import { fr } from "@codegouvfr/react-dsfr";
import { createRouter, type RegisteredRouter, type RouteIds } from "@tanstack/react-router";

import { CommunityMemberDtoRightsEnum } from "@/@types/entrepot";
import LoadingText from "@/components/Utils/LoadingText";
import { basePath } from "@/env";
import { trackPageViews } from "@/modules/analytics";
import RQKeys from "@/modules/entrepot/RQKeys";
import { queryClient, userMeHash } from "@/modules/queryClient";
import { routeTree } from "@/routeTree.gen";
import { bootstrapUser } from "@/utils";

// user_me amorcé avant que le routeur ne lise le cache (gates, abonnement ci-dessous)
bootstrapUser();

export const router = createRouter({
    routeTree,
    basepath: basePath || "/",
    context: { queryClient },
    // préchargement au survol d’un lien : un délai court évite les rafales en parcourant une liste
    defaultPreload: "intent",
    defaultPreloadDelay: 200,
    // react-query décide de la fraîcheur, pas le cache de préchargement du routeur
    defaultPreloadStaleTime: 0,
    // chargement du chunk d’une feuille, dans l’Outlet du layout parent : pas de Main, le layout fournit déjà main et fil d’Ariane
    defaultPendingComponent: () => (
        <div className={fr.cx("fr-container", "fr-my-4w")}>
            <LoadingText withSpinnerIcon />
        </div>
    ),
});

trackPageViews(router);

// toute nouvelle valeur de user_me (reconnexion, revalidation, droits modifiés) ré-évalue les gates ; partage structurel : même référence si rien n’a changé
let lastUser = queryClient.getQueryData(RQKeys.user_me());
queryClient.getQueryCache().subscribe((event) => {
    if (event.type !== "updated" || event.query.queryHash !== userMeHash || event.query.state.data === lastUser) return;
    lastUser = event.query.state.data;
    void router.invalidate();
});

/** identifiant de route vérifié par le compilateur : un fichier de route renommé casse le type-check */
export type RouteId = RouteIds<RegisteredRouter["routeTree"]>;

declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
    interface StaticDataRouteOption {
        /** droits exigés sur la communauté (tous), lus par les gates des layouts entrepôt et communauté */
        requiredRights?: CommunityMemberDtoRightsEnum[];
        /** layout des pages accessibles sans connexion */
        public?: boolean;
        /** titre de la page vue Matomo, obligatoire sur chaque feuille */
        matomoLabel?: string;
    }
}

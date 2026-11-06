import { hashKey } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";

import { CommunityMemberDtoRightsEnum } from "@/@types/entrepot";
import Main from "@/components/Layout/Main";
import LoadingText from "@/components/Utils/LoadingText";
import { basePath } from "@/env";
import { trackPageViews } from "@/modules/analytics";
import RQKeys from "@/modules/entrepot/RQKeys";
import { queryClient } from "@/modules/queryClient";
import { routeTree } from "@/routeTree.gen";

export const router = createRouter({
    routeTree,
    basepath: basePath || "/",
    context: { queryClient },
    // react-query décide de la fraîcheur, pas le cache de préchargement du routeur
    defaultPreloadStaleTime: 0,
    // chargement du chunk d’une feuille : rendu dans l’Outlet du layout parent
    defaultPendingComponent: () => (
        <Main>
            <LoadingText withSpinnerIcon />
        </Main>
    ),
});

trackPageViews(router);

// toute nouvelle valeur de user_me (reconnexion, revalidation, droits modifiés) ré-évalue les gates ; partage structurel : même référence si rien n’a changé
const userMeHash = hashKey(RQKeys.user_me());
let lastUser = queryClient.getQueryData(RQKeys.user_me());
queryClient.getQueryCache().subscribe((event) => {
    if (event.type !== "updated" || event.query.queryHash !== userMeHash || event.query.state.data === lastUser) return;
    lastUser = event.query.state.data;
    void router.invalidate();
});

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

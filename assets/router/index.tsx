import { createRouter } from "@tanstack/react-router";

import { CommunityMemberDtoRightsEnum } from "@/@types/entrepot";
import Main from "@/components/Layout/Main";
import LoadingText from "@/components/Utils/LoadingText";
import { basePath } from "@/env";
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

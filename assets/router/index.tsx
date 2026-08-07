import { createRouter } from "@tanstack/react-router";

import { CommunityMemberDtoRightsEnum } from "../@types/entrepot";
import LoadingText from "../components/Utils/LoadingText";
import Main from "../components/Layout/Main";
import SymfonyRouting from "../modules/Routing";
import { queryClient, setOnUserRevalidated } from "../modules/queryClient";
import { routeTree } from "../routeTree.gen";

// Router TanStack : basepath dérivé du routing Symfony (vide en dev → "/"), contexte typé { queryClient }
export const router = createRouter({
    routeTree,
    basepath: SymfonyRouting.getBaseUrl() || "/",
    context: { queryClient },
    defaultPreload: false,
    // chargement des chunks de routes (autoCodeSplitting) : rendu dans l'Outlet du layout parent
    defaultPendingComponent: () => (
        <Main>
            <LoadingText withSpinnerIcon />
        </Main>
    ),
});

// Couture unique de revalidation (décision 5) : user_me revalidé → les beforeLoad se ré-exécutent
setOnUserRevalidated(() => router.invalidate());

declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
    // Droits requis par route (sémantique : TOUS les droits listés), lus par les gates des sous-arbres
    interface StaticDataRouteOption {
        requiredRights?: CommunityMemberDtoRightsEnum[];
    }
}

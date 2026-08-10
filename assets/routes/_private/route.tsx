import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { CartesUser } from "@/@types/app";
import AppLayout from "@/components/Layout/AppLayout";
import Main from "@/components/Layout/Main";
import LoadingText from "@/components/Utils/LoadingText";
import RQKeys from "@/entrepot/modules/RQKeys";
import SymfonyRouting from "@/modules/Routing";
import PageNotFound from "@/pages/error/PageNotFound";

// Gate d'authentification (remplace RedirectToLogin) : user_me est bootstrappé dans le cache,
// null = anonyme (jamais « en cours de chargement ») → login Keycloak via Symfony, navigation pleine page
export const Route = createFileRoute("/_private")({
    beforeLoad: ({ context }) => {
        const user = context.queryClient.getQueryData<CartesUser | null>(RQKeys.user_me());
        if (!user) {
            throw redirect({ href: SymfonyRouting.generate("cartesgouvfr_security_login"), reloadDocument: true });
        }
    },
    component: PrivateLayout,
    notFoundComponent: PageNotFound,
    // ce layout pend au chargement de son chunk (rechargement pleine page) : en-tête et pied de page affichés, pas le pending nu de la racine
    pendingComponent: PrivateLayoutPending,
});

function PrivateLayout() {
    return (
        <AppLayout>
            <Outlet />
        </AppLayout>
    );
}

function PrivateLayoutPending() {
    return (
        <AppLayout>
            <Main>
                <LoadingText withSpinnerIcon />
            </Main>
        </AppLayout>
    );
}

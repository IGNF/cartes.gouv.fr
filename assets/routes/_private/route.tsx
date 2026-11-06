import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { CartesUser } from "@/@types/app";
import AppLayout from "@/components/Layout/AppLayout";
import Main from "@/components/Layout/Main";
import LoadingText from "@/components/Utils/LoadingText";
import RQKeys from "@/modules/entrepot/RQKeys";
import SymfonyRouting from "@/modules/Routing";
import PageNotFound from "@/pages/error/PageNotFound";

export const Route = createFileRoute("/_private")({
    // user_me est amorcé depuis la page (null = anonyme) : connexion Keycloak en navigation pleine page
    beforeLoad: ({ context }) => {
        if (!context.queryClient.getQueryData<CartesUser | null>(RQKeys.user_me())) {
            throw redirect({ href: SymfonyRouting.generate("cartesgouvfr_security_login"), reloadDocument: true });
        }
    },
    // présent sur toutes les pages connectées : pas de chunk séparé
    codeSplitGroupings: [],
    component: PrivateLayout,
    pendingComponent: PrivateLayoutPending,
    notFoundComponent: PageNotFound,
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

import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { CartesUser } from "@/@types/app";
import AppLayout from "@/components/Layout/AppLayout";
import Main from "@/components/Layout/Main";
import LoadingText from "@/components/Utils/LoadingText";
import RQKeys from "@/modules/entrepot/RQKeys";
import SymfonyRouting from "@/modules/Routing";
import PageNotFoundWithLayout from "@/pages/error/PageNotFoundWithLayout";

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
    // remplace aussi la mise en page du layout : la page 404 apporte la sienne
    notFoundComponent: PageNotFoundWithLayout,
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

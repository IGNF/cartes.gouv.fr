import { createFileRoute, Outlet } from "@tanstack/react-router";

import AppLayout from "@/components/Layout/AppLayout";
import Main from "@/components/Layout/Main";
import LoadingText from "@/components/Utils/LoadingText";
import { defaultNavItems } from "@/config/navItems/navItems";
import PageNotFound from "@/pages/error/PageNotFound";

// Layout pathless des routes publiques : navigation par défaut, aucun gate
export const Route = createFileRoute("/_public")({
    component: PublicLayout,
    notFoundComponent: PageNotFound,
    // ce layout pend au chargement de son chunk (rechargement pleine page) : chrome complet, pas le pending nu de la racine
    pendingComponent: PublicLayoutPending,
});

function PublicLayout() {
    return (
        <AppLayout navItems={defaultNavItems()}>
            <Outlet />
        </AppLayout>
    );
}

function PublicLayoutPending() {
    return (
        <AppLayout navItems={defaultNavItems()}>
            <Main>
                <LoadingText withSpinnerIcon />
            </Main>
        </AppLayout>
    );
}

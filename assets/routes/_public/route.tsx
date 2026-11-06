import { createFileRoute, Outlet } from "@tanstack/react-router";

import AppLayout from "@/components/Layout/AppLayout";
import Main from "@/components/Layout/Main";
import LoadingText from "@/components/Utils/LoadingText";
import { defaultNavItems } from "@/config/navItems/navItems";
import PageNotFound from "@/pages/error/PageNotFound";

export const Route = createFileRoute("/_public")({
    staticData: { public: true },
    // présent sur toutes les pages publiques : pas de chunk séparé
    codeSplitGroupings: [],
    component: PublicLayout,
    pendingComponent: PublicLayoutPending,
    // remplace aussi la mise en page du layout : la page 404 apporte la sienne
    notFoundComponent: PublicNotFound,
});

function PublicLayout() {
    return (
        <AppLayout navItems={defaultNavItems()}>
            <Outlet />
        </AppLayout>
    );
}

function PublicNotFound() {
    return (
        <AppLayout navItems={defaultNavItems()}>
            <PageNotFound />
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

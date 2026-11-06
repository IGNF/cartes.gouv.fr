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
    notFoundComponent: PageNotFound,
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

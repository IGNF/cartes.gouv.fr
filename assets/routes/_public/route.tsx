import { createFileRoute, Outlet } from "@tanstack/react-router";

import AppLayout from "@/components/Layout/AppLayout";
import Main from "@/components/Layout/Main";
import LoadingText from "@/components/Utils/LoadingText";
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
        <AppLayout>
            <Outlet />
        </AppLayout>
    );
}

function PublicNotFound() {
    return (
        <AppLayout>
            <PageNotFound />
        </AppLayout>
    );
}

function PublicLayoutPending() {
    return (
        <AppLayout>
            <Main>
                <LoadingText withSpinnerIcon />
            </Main>
        </AppLayout>
    );
}

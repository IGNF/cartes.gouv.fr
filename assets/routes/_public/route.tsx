import { createFileRoute, Outlet } from "@tanstack/react-router";

import AppLayout from "@/components/Layout/AppLayout";
import { defaultNavItems } from "@/config/navItems/navItems";
import PageNotFound from "@/pages/error/PageNotFound";

// Layout pathless des routes publiques : navigation par défaut, aucun gate
export const Route = createFileRoute("/_public")({
    component: PublicLayout,
    notFoundComponent: PageNotFound,
});

function PublicLayout() {
    return (
        <AppLayout navItems={defaultNavItems()}>
            <Outlet />
        </AppLayout>
    );
}

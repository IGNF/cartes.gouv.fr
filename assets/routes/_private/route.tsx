import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { CartesUser } from "@/@types/app";
import AppLayout from "@/components/Layout/AppLayout";
import RQKeys from "@/modules/entrepot/RQKeys";
import SymfonyRouting from "@/modules/Routing";
import PageNotFound from "@/pages/error/PageNotFound";

// Gate d'authentification (remplace RedirectToLogin) : user_me est bootstrappé dans le cache,
// null = anonyme (jamais « en cours de chargement ») → login Keycloak via Symfony, navigation pleine page
export const Route = createFileRoute("/_private")({
    beforeLoad: ({ context }) => {
        const user = context.queryClient.getQueryData<CartesUser | null>(RQKeys.user_me());
        if (!user) {
            throw redirect({ href: SymfonyRouting.generate("cartesgouvfr_security_login") });
        }
    },
    component: PrivateLayout,
    notFoundComponent: PageNotFound,
});

function PrivateLayout() {
    return (
        <AppLayout>
            <Outlet />
        </AppLayout>
    );
}

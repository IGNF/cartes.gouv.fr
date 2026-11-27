import { createFileRoute, Outlet } from "@tanstack/react-router";

import api from "@/espaceco/api";
import EspaceCoTermsGate from "@/espaceco/components/EspaceCoTermsGate";
import { isTermsNotAcceptedError } from "@/espaceco/esco_utils";
import RQKeys from "@/modules/espaceco/RQKeys";

export const Route = createFileRoute("/_private/_cgu-espaceco")({
    // l’utilisateur de l’espace collaboratif n’est pas amorcé depuis la page : chargé avant le sous-arbre
    beforeLoad: async ({ context }) => {
        try {
            await context.queryClient.query({
                queryKey: RQKeys.getMe(),
                queryFn: ({ signal }) => api.user.getMe(signal),
                staleTime: "static",
            });
        } catch (error) {
            // CGU non acceptées : message affiché par EspaceCoTermsGate
            if (!isTermsNotAcceptedError(error)) throw error;
        }
    },
    component: () => (
        <EspaceCoTermsGate>
            <Outlet />
        </EspaceCoTermsGate>
    ),
});

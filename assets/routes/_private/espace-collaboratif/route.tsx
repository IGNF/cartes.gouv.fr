import { createFileRoute } from "@tanstack/react-router";

import api from "@/espaceco/api";
import RQKeys from "@/modules/espaceco/RQKeys";

export const Route = createFileRoute("/_private/espace-collaboratif")({
    // l’utilisateur de l’espace collaboratif n’est pas amorcé depuis la page : chargé avant le sous-arbre
    beforeLoad: async ({ context }) => {
        await context.queryClient.query({
            queryKey: RQKeys.getMe(),
            queryFn: ({ signal }) => api.user.getMe(signal),
            staleTime: "static",
        });
    },
});

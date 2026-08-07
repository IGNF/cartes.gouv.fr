import { createFileRoute } from "@tanstack/react-router";

import api from "@/espaceco/api";
import RQKeys from "@/modules/espaceco/RQKeys";

// Gate async localisé au sous-arbre espaceco : le « me » espaceco n'est pas bootstrappé dans le DOM (décision 8)
export const Route = createFileRoute("/_private/espace-collaboratif")({
    beforeLoad: async ({ context }) => {
        await context.queryClient.ensureQueryData({
            queryKey: RQKeys.getMe(),
            queryFn: ({ signal }) => api.user.getMe(signal),
        });
    },
});

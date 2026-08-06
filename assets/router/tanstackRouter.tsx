import { createRouter } from "@tanstack/react-router";

import SymfonyRouting from "@/modules/Routing";
import { queryClient } from "@/modules/queryClient";
import { routeTree } from "@/routeTree.gen";

// SPIKE : instance du router TanStack — basepath dérivé du routing Symfony (décision 10)
export const router = createRouter({
    routeTree,
    basepath: SymfonyRouting.getBaseUrl() || "/",
    context: { queryClient },
    defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}

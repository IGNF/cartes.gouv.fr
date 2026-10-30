import { QueryClient } from "@tanstack/react-query";

import { ApiError } from "./jsonFetch";

// erreur par défaut des requêtes : corps d'erreur de l'API (jsonFetch) ou erreur JavaScript (réseau, appel hors API)
declare module "@tanstack/react-query" {
    interface Register {
        defaultError: ApiError | Error;
    }
}

/**
 * L'instance de QueryClient utilisée dans toute l'application.
 */
export const queryClient = new QueryClient();

import { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet, SearchParamError } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

// SPIKE : route racine minimale, contexte typé { queryClient }
export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
    component: RootComponent,
    notFoundComponent: () => <h1>404 — page non trouvée (spike)</h1>,
    // écart de spec type-route : un échec de validateSearch arrive ici enveloppé
    // dans SearchParamError → mappé explicitement vers la 404
    errorComponent: ({ error }) => {
        if (error instanceof SearchParamError) {
            return <h1>404 — page non trouvée (spike, via SearchParamError)</h1>;
        }
        return <h1>Erreur (spike) : {String(error)}</h1>;
    },
});

function RootComponent() {
    return (
        <>
            <Outlet />
            {import.meta.env.DEV && <TanStackRouterDevtools />}
        </>
    );
}

import { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, ErrorComponentProps, Outlet, SearchParamError, useRouter } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import AppLayout from "../components/Layout/AppLayout";
import Main from "../components/Layout/Main";
import LoadingText from "../components/Utils/LoadingText";
import PageNotFoundWithLayout from "../pages/error/PageNotFoundWithLayout";
import UnexpectedError from "../pages/error/UnexpectedError";

// Route racine : contexte typé { queryClient } + partition d'erreurs par défaut de tout l'arbre
export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
    component: RootComponent,
    notFoundComponent: PageNotFoundWithLayout,
    errorComponent: RootErrorComponent,
    pendingComponent: RootPending,
});

function RootPending() {
    return (
        <AppLayout>
            <Main>
                <LoadingText withSpinnerIcon />
            </Main>
        </AppLayout>
    );
}

function RootErrorComponent({ error }: ErrorComponentProps) {
    const router = useRouter();

    // Un échec de validateSearch arrive enveloppé dans SearchParamError (jamais dans notFoundComponent) → 404
    if (error instanceof SearchParamError) {
        return <PageNotFoundWithLayout />;
    }

    return (
        <AppLayout>
            <UnexpectedError message={error.message} onRetry={() => router.invalidate()} />
        </AppLayout>
    );
}

function RootComponent() {
    return (
        <>
            <Outlet />
            {import.meta.env.DEV && <TanStackRouterDevtools />}
        </>
    );
}

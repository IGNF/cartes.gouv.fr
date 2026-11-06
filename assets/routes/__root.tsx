import { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, ErrorComponentProps, Outlet, SearchParamError, useRouter } from "@tanstack/react-router";

import AppLayout from "@/components/Layout/AppLayout";
import Main from "@/components/Layout/Main";
import LoadingText from "@/components/Utils/LoadingText";
import PageNotFoundWithLayout from "@/pages/error/PageNotFoundWithLayout";
import UnexpectedError from "@/pages/error/UnexpectedError";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
    component: Outlet,
    pendingComponent: RootPending,
    errorComponent: RootError,
    notFoundComponent: PageNotFoundWithLayout,
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

function RootError({ error }: ErrorComponentProps) {
    const router = useRouter();

    // un échec de validateSearch arrive en SearchParamError, jamais au notFoundComponent
    if (error instanceof SearchParamError) {
        return <PageNotFoundWithLayout />;
    }

    return (
        <AppLayout>
            <UnexpectedError message={error instanceof Error ? error.message : undefined} onRetry={() => void router.invalidate()} />
        </AppLayout>
    );
}

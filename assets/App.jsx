import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React from "react";
import ErrorBoundary from "./components/Utils/ErrorBoundary";
import { UserContextProvider } from "./contexts/UserContext";
import RouterRenderer from "./router/RouterRenderer";
import { RouteProvider } from "./router/router";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            useErrorBoundary: true,
        },
    },
});

const App = () => {
    return (
        <>
            <QueryClientProvider client={queryClient}>
                <ReactQueryDevtools initialIsOpen={false} />
                <UserContextProvider>
                    <RouteProvider>
                        <ErrorBoundary>
                            <RouterRenderer />
                        </ErrorBoundary>
                    </RouteProvider>
                </UserContextProvider>
            </QueryClientProvider>
        </>
    );
};

export default App;

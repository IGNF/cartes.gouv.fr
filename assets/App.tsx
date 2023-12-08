import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { FC } from "react";

import ErrorBoundary from "./components/Utils/ErrorBoundary";
import RouterRenderer from "./router/RouterRenderer";
import { RouteProvider } from "./router/router";

const queryClient = new QueryClient();

const App: FC = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <ReactQueryDevtools initialIsOpen={false} />

            <RouteProvider>
                <ErrorBoundary>
                    <RouterRenderer />
                </ErrorBoundary>
            </RouteProvider>
        </QueryClientProvider>
    );
};

export default App;

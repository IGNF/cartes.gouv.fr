import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import ErrorBoundary from "./components/Utils/ErrorBoundary";
import { UserContextProvider } from "./contexts/UserContext";
import RouterRenderer from "./router/RouterRenderer";
import { RouteProvider } from "./router/router";
import { FC } from "react";

const queryClient = new QueryClient();

const App: FC = () => {
    return (
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
    );
};

export default App;

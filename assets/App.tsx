import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { FC } from "react";

import ErrorBoundary from "./components/Utils/ErrorBoundary";
import RouterRenderer from "./router/RouterRenderer";
import { RouteProvider } from "./router/router";
import AlertProvider from "./components/Provider/AlertProvider";

const queryClient = new QueryClient();

const persister = createSyncStoragePersister({
    storage: window.localStorage,
});

const App: FC = () => {
    return (
        <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
            <ReactQueryDevtools initialIsOpen={false} />

            <RouteProvider>
                <ErrorBoundary>
                    <AlertProvider>
                        <RouterRenderer />
                    </AlertProvider>
                </ErrorBoundary>
            </RouteProvider>
        </PersistQueryClientProvider>
    );
};

export default App;

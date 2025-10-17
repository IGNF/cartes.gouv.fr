import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { FC } from "react";

import AlertProvider from "./components/Provider/AlertProvider";
import ErrorBoundary from "./components/Utils/ErrorBoundary";
import RouterRenderer from "./router/RouterRenderer";
import { RouteProvider } from "./router/router";

import "./sass/helpers.scss";

const queryClient = new QueryClient();

const persister = createAsyncStoragePersister({
    storage: window.localStorage,
});

const maxAge = 1000 * 60 * 60 * 24; // 24h

const App: FC = () => {
    return (
        <PersistQueryClientProvider client={queryClient} persistOptions={{ persister, buster: __GIT_COMMIT__ ?? "buster-react-query", maxAge: maxAge }}>
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

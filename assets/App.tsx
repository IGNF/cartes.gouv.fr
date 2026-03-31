import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { FC } from "react";

import AlertProvider from "./components/Provider/AlertProvider";
import ErrorBoundary from "./components/Utils/ErrorBoundary";
import { queryClient } from "./modules/queryClient";
import { RouteProvider } from "./router/router";
import RouterRenderer from "./router/RouterRenderer";

import "./sass/helpers.scss";
import { bootstrapUser } from "./utils";

const persister = createAsyncStoragePersister({
    storage: window.localStorage,
});

const maxAge = 1000 * 60 * 60 * 24; // 24h

bootstrapUser();

const App: FC = () => {
    return (
        <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{
                persister,
                buster: __GIT_COMMIT__ ?? "buster-react-query",
                maxAge,
                dehydrateOptions: {
                    // ne pas persister les données utilisateur : elles sont
                    // rechargées depuis le serveur à chaque chargement de page
                    // shouldDehydrateQuery: (query) => !query.queryKey.includes("user"),
                },
            }}
        >
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

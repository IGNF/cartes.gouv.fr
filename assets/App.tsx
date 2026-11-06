import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { defaultShouldDehydrateQuery, hashKey } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { FC } from "react";

import AlertProvider from "./components/Provider/AlertProvider";
import ErrorBoundary from "./components/Utils/ErrorBoundary";
import { cacheBuster } from "./env";
import RQKeys from "./modules/entrepot/RQKeys";
import { queryClient } from "./modules/queryClient";
import { RouteProvider } from "./router/router";
import RouterRenderer from "./router/RouterRenderer";
import { bootstrapUser } from "./utils";

import "./sass/helpers.scss";

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
                buster: cacheBuster,
                maxAge,
                dehydrateOptions: {
                    // ne pas persister (localstorage) les données utilisateur : elles sont rechargées depuis le serveur à chaque chargement de page
                    shouldDehydrateQuery: (query) => defaultShouldDehydrateQuery(query) && query.queryHash !== hashKey(RQKeys.user_me()),
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

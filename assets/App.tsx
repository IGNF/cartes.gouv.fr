import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { defaultShouldDehydrateQuery } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { RouterProvider } from "@tanstack/react-router";
import { FC } from "react";

import AlertProvider from "./components/Provider/AlertProvider";
import ErrorBoundary from "./components/Utils/ErrorBoundary";
import { isUserMeQueryKey, queryClient } from "./modules/queryClient";
import { router } from "./router/tanstackRouter";
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
                buster: __GIT_COMMIT__ ?? "buster-react-query",
                maxAge,
                dehydrateOptions: {
                    // ne pas persister (localstorage) les données utilisateur : elles sont rechargées depuis le serveur à chaque chargement de page
                    shouldDehydrateQuery: (query) => {
                        return defaultShouldDehydrateQuery(query) && !isUserMeQueryKey(query.queryKey);
                    },
                },
            }}
        >
            <ReactQueryDevtools initialIsOpen={false} />

            {/* SPIKE : RouterProvider TanStack à la place de RouteProvider/RouterRenderer (type-route) */}
            <ErrorBoundary>
                <AlertProvider>
                    <RouterProvider router={router} />
                </AlertProvider>
            </ErrorBoundary>
        </PersistQueryClientProvider>
    );
};

export default App;

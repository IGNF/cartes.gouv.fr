import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { defaultShouldDehydrateQuery, hashKey } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { RouterProvider } from "@tanstack/react-router";
import { FC, lazy, Suspense } from "react";

import AlertProvider from "./components/Provider/AlertProvider";
import ErrorBoundary from "./components/Utils/ErrorBoundary";
import { cacheBuster } from "./env";
import RQKeys from "./modules/entrepot/RQKeys";
import { queryClient } from "./modules/queryClient";
import { router } from "./router";
import { RouteProvider } from "./router/router";
import { bootstrapUser } from "./utils";

import "./sass/helpers.scss";

const persister = createAsyncStoragePersister({
    storage: window.localStorage,
});

const maxAge = 1000 * 60 * 60 * 24; // 24h

bootstrapUser();

// retiré du build de production par élimination de code mort
const Devtools = import.meta.env.DEV ? lazy(() => import("./devtools")) : () => null;

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
            <Suspense fallback={null}>
                <Devtools />
            </Suspense>

            {/* RouteProvider de type-route gardé tant que des pages lisent useRoute */}
            <RouteProvider>
                <ErrorBoundary>
                    <AlertProvider>
                        <RouterProvider router={router} />
                    </AlertProvider>
                </ErrorBoundary>
            </RouteProvider>
        </PersistQueryClientProvider>
    );
};

export default App;

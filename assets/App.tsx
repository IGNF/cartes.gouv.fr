import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { FC } from "react";

import AlertProvider from "./components/Provider/AlertProvider";
import AuthProvider from "./components/Provider/AuthProvider";
import ErrorBoundary from "./components/Utils/ErrorBoundary";
import RQKeys from "./modules/entrepot/RQKeys";
import { persister, queryClient } from "./modules/reactQuery";
import { RouteProvider } from "./router/router";
import RouterRenderer from "./router/RouterRenderer";
import { delta } from "./utils";

import "./sass/helpers.scss";

const maxAge = delta.hours(24);

const isUserMeQueryKey = (queryKey: unknown): boolean => {
    const userMeKey = RQKeys.user_me();
    if (!Array.isArray(queryKey)) return false;

    return queryKey.length === userMeKey.length && queryKey.every((value, index) => value === userMeKey[index]);
};

const App: FC = () => {
    return (
        <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{
                persister,
                buster: __GIT_COMMIT__ ?? "buster-react-query",
                maxAge: maxAge,
                dehydrateOptions: {
                    shouldDehydrateQuery: (query) => !isUserMeQueryKey(query.queryKey),
                },
            }}
        >
            <ReactQueryDevtools initialIsOpen={false} />

            <RouteProvider>
                <ErrorBoundary>
                    <AlertProvider>
                        <AuthProvider>
                            <RouterRenderer />
                        </AuthProvider>
                    </AlertProvider>
                </ErrorBoundary>
            </RouteProvider>
        </PersistQueryClientProvider>
    );
};

export default App;

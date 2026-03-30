import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { FC } from "react";

import AlertProvider from "./components/Provider/AlertProvider";
import ErrorBoundary from "./components/Utils/ErrorBoundary";
import useSyncSessionExpiredFromUser from "./hooks/useSyncSessionExpiredFromUser";
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

const AuthSessionSync: FC = () => {
    useSyncSessionExpiredFromUser();
    return null;
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

            <AuthSessionSync />

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

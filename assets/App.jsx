import React from "react";

import ErrorBoundary from "./components/Utils/ErrorBoundary";
import { UserContextProvider } from "./contexts/UserContext";
import RouterRenderer from "./router/RouterRenderer";
import { RouteProvider } from "./router/router";

const App = () => {
    return (
        <>
            <UserContextProvider>
                <RouteProvider>
                    <ErrorBoundary>
                        <RouterRenderer />
                    </ErrorBoundary>
                </RouteProvider>
            </UserContextProvider>
        </>
    );
};

export default App;

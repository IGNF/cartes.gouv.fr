import React from "react";
import AppLayout from "./components/Layout/AppLayout";

import { UserContextProvider } from "./contexts/UserContext";
import { RouteProvider, RouterRenderer } from "./router";

const App = () => {
    return (
        <>
            <UserContextProvider>
                <RouteProvider>
                    <AppLayout>
                        <main role="main">
                            <RouterRenderer />
                        </main>
                    </AppLayout>
                </RouteProvider>
            </UserContextProvider>
        </>
    );
};

export default App;

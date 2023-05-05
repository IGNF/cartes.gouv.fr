import Routing from "fos-router";
import React, { Suspense, lazy, useContext } from "react";

import AppLayout from "../components/Layout/AppLayout";
import LoadingText from "../components/Utils/LoadingText";
import { defaultNavItems } from "../config/navItems";
import { UserContext } from "../contexts/UserContext";
import Home from "../pages/Home";
import Redirect from "../pages/Redirect";
import PageNotFound from "../pages/error/PageNotFound";
import { protectedRoutes, useRoute } from "./router";

const Docs = lazy(() => import("../pages/Docs"));
const MyAccount = lazy(() => import("../pages/MyAccount"));
const DatastoreList = lazy(() => import("../pages/datastores/DatastoreList"));

function RouterRenderer() {
    const route = useRoute();
    const { user } = useContext(UserContext);

    if (protectedRoutes.includes(route.name)) {
        // vérifier si l'utilisateur est authentifié et éventuellement ses droits à la ressource demandée
        if (user == null) {
            // window.location.href = Routing.generate("cartesgouvfr_security_login");
            window.location.assign(Routing.generate("cartesgouvfr_security_login"));
            return <Redirect />;
        }
    }

    let content = null;

    switch (route.name) {
        case "home":
            content = <Home />;
            break;
        case "my_account":
            content = <MyAccount />;
            break;
        case "datastores_list":
            content = <DatastoreList />;
            break;
        case "docs":
            content = <Docs />;
            break;
        default:
            content = <PageNotFound />;
            break;
    }

    return (
        <Suspense
            fallback={
                <AppLayout navItems={defaultNavItems}>
                    <LoadingText />
                </AppLayout>
            }
        >
            {content}
        </Suspense>
    );
}

export default RouterRenderer;

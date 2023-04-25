import React, { Suspense, lazy, useContext } from "react";

import Routing from "fos-router";
import { UserContext } from "../contexts/UserContext";
import { protectedRoutes, useRoute } from "./router";

import AppLayout from "../components/Layout/AppLayout";
import Loading from "../components/Layout/Loading";
import { defaultNavItems } from "../config/navItems";
import Home from "../pages/Home";
import PageNotFound from "../pages/error/PageNotFound";

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
            return <h2>Redirection vers la page de connexion...</h2>;
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
                    <Loading />
                </AppLayout>
            }
        >
            {content}
        </Suspense>
    );
}

export default RouterRenderer;

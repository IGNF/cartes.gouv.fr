import Routing from "fos-router";
import React, { Suspense, useContext } from "react";
import { createRouter, defineRoute } from "type-route";

import { UserContext } from "./contexts/UserContext";

import Loading from "./components/Layout/Loading";
import Home from "./pages/Home";
import PageNotFound from "./pages/error/PageNotFound";

const Docs = React.lazy(() => import("./pages/Docs"));
const MyAccount = React.lazy(() => import("./pages/MyAccount"));
const DatastoreList = React.lazy(() => import("./pages/datastores/DatastoreList"));

const routeDefs = {
    home: defineRoute("/"),
    my_account: defineRoute("/mon-compte"),
    datastores_list: defineRoute("/datastores"),
    docs: defineRoute("/docs"),
};

export const { RouteProvider, useRoute, routes } = createRouter(routeDefs);

const protectedRoutes = ["my_account", "datastores_list"];

export function RouterRenderer() {
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

    return <Suspense fallback={<Loading />}>{content}</Suspense>;
}

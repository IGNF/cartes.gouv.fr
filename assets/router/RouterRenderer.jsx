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
const Contact = lazy(() => import("../pages/Contact"));
const News = lazy(() => import("../pages/News"));
const Sitemap = lazy(() => import("../pages/footer/Sitemap"));
const Accessibility = lazy(() => import("../pages/footer/Accessibility"));
const LegalNotice = lazy(() => import("../pages/footer/LegalNotice"));
const PersonalData = lazy(() => import("../pages/footer/PersonalData"));
const Cookies = lazy(() => import("../pages/footer/Cookies"));
const MyAccount = lazy(() => import("../pages/MyAccount"));
const DatastoreList = lazy(() => import("../pages/datastores/DatastoreList"));
const DatastoreDashboard = lazy(() => import("../pages/datastores/DatastoreDashboard"));
const DataNewForm = lazy(() => import("../pages/data/DataNewForm"));

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
        case "docs":
            content = <Docs />;
            break;
        case "contact":
            content = <Contact />;
            break;
        case "news":
            content = <News />;
            break;
        case "sitemap":
            content = <Sitemap />;
            break;
        case "accessibility":
            content = <Accessibility />;
            break;
        case "legal_notice":
            content = <LegalNotice />;
            break;
        case "personal_data":
            content = <PersonalData />;
            break;
        case "cookies":
            content = <Cookies />;
            break;
        case "my_account":
            content = <MyAccount />;
            break;
        case "datastore_list":
            content = <DatastoreList />;
            break;
        case "datastore_dashboard":
            content = <DatastoreDashboard datastoreId={route.params.datastoreId} />;
            break;
        case "datastore_data_new":
            content = <DataNewForm datastoreId={route.params.datastoreId} />;
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

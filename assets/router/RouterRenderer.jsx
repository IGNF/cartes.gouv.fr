import Routing from "fos-router";
import React, { Suspense, lazy, useContext } from "react";

import AppLayout from "../components/Layout/AppLayout";
import LoadingText from "../components/Utils/LoadingText";
import { defaultNavItems } from "../config/navItems";
import { UserContext } from "../contexts/UserContext";
import Home from "../pages/Home";
import Redirect from "../pages/Redirect";
import PageNotFound from "../pages/error/PageNotFound";
import { knownRoutes, publicRoutes, useRoute } from "./router";

const About = lazy(() => import("../pages/About"));
const Docs = lazy(() => import("../pages/Docs"));
const Contact = lazy(() => import("../pages/contact/Contact"));
const Thanks = lazy(() => import("../pages/contact/Thanks"));
const NewsList = lazy(() => import("../pages/news/NewsList"));
const NewsArticle = lazy(() => import("../pages/news/NewsArticle"));
const Faq = lazy(() => import("../pages/Faq"));
const Sitemap = lazy(() => import("../pages/footer/Sitemap"));
const Accessibility = lazy(() => import("../pages/footer/Accessibility"));
const LegalNotice = lazy(() => import("../pages/footer/LegalNotice"));
const PersonalData = lazy(() => import("../pages/footer/PersonalData"));
const Cookies = lazy(() => import("../pages/footer/Cookies"));
const Me = lazy(() => import("../pages/users/Me"));
const DatastoreList = lazy(() => import("../pages/datastores/DatastoreList"));
const DatastoreDashboard = lazy(() => import("../pages/datastores/DatastoreDashboard"));
const DatastoreDataList = lazy(() => import("../pages/datastores/DatastoreDataList"));
const DataNewForm = lazy(() => import("../pages/datasheet/DatasheetNew/DataNewForm"));
const DataNewIntegrationPage = lazy(() => import("../pages/datasheet/DatasheetNew/DatasheetNewIntegration/DataNewIntegration"));
const DataView = lazy(() => import("../pages/datasheet/DatasheetView/DataView"));
const WfsServiceNew = lazy(() => import("../pages/service/wfs/WfsServiceNew"));

function RouterRenderer() {
    const route = useRoute();
    const { user } = useContext(UserContext);

    // vérification si la route demandée est bien connue/enregistrée
    if (!knownRoutes.includes(route.name)) {
        return <PageNotFound />;
    }

    if (!publicRoutes.includes(route.name)) {
        // vérifier si l'utilisateur est authentifié et éventuellement ses droits à la ressource demandée
        if (user === null) {
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
        case "about":
            content = <About />;
            break;
        case "docs":
            content = <Docs />;
            break;
        case "contact":
            content = <Contact />;
            break;
        case "contact_thanks":
            content = <Thanks />;
            break;
        case "news_list":
            content = <NewsList />;
            break;
        case "news_article":
            content = <NewsArticle slug={route.params.slug} />;
            break;
        case "faq":
            content = <Faq />;
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
        case "cgu":
            content = <h1>Route non implementée</h1>;
            break;
        case "my_account":
            content = <Me />;
            break;
        case "datastore_list":
            content = <DatastoreList />;
            break;
        case "datastore_dashboard":
            content = <DatastoreDashboard datastoreId={route.params.datastoreId} />;
            break;
        case "datastore_datasheet_list":
            content = <DatastoreDataList datastoreId={route.params.datastoreId} />;
            break;
        case "datastore_datasheet_new":
            content = <DataNewForm datastoreId={route.params.datastoreId} />;
            break;
        case "datastore_datasheet_new_integration":
            content = <DataNewIntegrationPage datastoreId={route.params.datastoreId} uploadId={route.params.uploadId} />;
            break;
        case "datastore_datasheet_view":
            content = <DataView datastoreId={route.params.datastoreId} dataName={route.params.dataName} />;
            break;
        case "datastore_wfs_service_new":
            content = <WfsServiceNew datastoreId={route.params.datastoreId} storedDataId={route.params.storedDataId} />;
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

import { JSX, Suspense, lazy } from "react";

import AppLayout from "../components/Layout/AppLayout";
import LoadingText from "../components/Utils/LoadingText";
import useUser from "../hooks/useUser";
import SymfonyRouting from "../modules/Routing";
import Home from "../pages/Home";
import Redirect from "../pages/Redirect";
import PageNotFound from "../pages/error/PageNotFound";
import { knownRoutes, publicRoutes, useRoute } from "./router";

const About = lazy(() => import("../pages/About"));
const Documentation = lazy(() => import("../pages/Documentation"));
const Contact = lazy(() => import("../pages/contact/Contact"));
const Thanks = lazy(() => import("../pages/contact/Thanks"));
const NewsList = lazy(() => import("../pages/news/NewsList"));
const NewsArticle = lazy(() => import("../pages/news/NewsArticle"));
const Faq = lazy(() => import("../pages/Faq"));
const Sitemap = lazy(() => import("../pages/footer/Sitemap"));
const Accessibility = lazy(() => import("../pages/footer/Accessibility"));
const LegalNotice = lazy(() => import("../pages/footer/LegalNotice"));
const PersonalData = lazy(() => import("../pages/footer/PersonalData"));

const Me = lazy(() => import("../pages/users/Me"));

const DashboardPro = lazy(() => import("../pages/dashboard/DashboardPro"));
const DatasheetList = lazy(() => import("../pages/datasheet/DatasheetList/DatasheetList"));

const DatasheetNewForm = lazy(() => import("../pages/datasheet/DatasheetNew/DatasheetNewForm"));
const DatasheetNewIntegrationPage = lazy(() => import("../pages/datasheet/DatasheetNew/DatasheetNewIntegration/DatasheetNewIntegration"));
const DatasheetView = lazy(() => import("../pages/datasheet/DatasheetView/DatasheetView"));

const StoredDataReport = lazy(() => import("../pages/stored_data/StoredDataReport/StoredDataReport"));

const DatastoreCreationForm = lazy(() => import("../pages/contact/datastore/DatastoreCreationForm"));
const Confirm = lazy(() => import("../pages/contact/datastore/Confirmation"));

const CommunityList = lazy(() => import("../pages/communities/CommunityList"));

const WfsServiceNew = lazy(() => import("../pages/service/wfs/WfsServiceNew"));
const WmsVectorServiceNew = lazy(() => import("../pages/service/wms-vector/WmsVectorServiceNew"));
const PyramidVectorNew = lazy(() => import("../pages/service/tms/PyramidVectorNew"));
const PublishTmsServiceNew = lazy(() => import("../pages/service/tms/PublishNew"));

const ServiceView = lazy(() => import("../pages/service/view/ServiceView"));

function RouterRenderer() {
    const route = useRoute();
    const { user } = useUser();

    // vérification si la route demandée est bien connue/enregistrée
    if (route.name === false || !knownRoutes.includes(route.name)) {
        return <PageNotFound />;
    }

    if (!publicRoutes.includes(route.name)) {
        // vérifier si l'utilisateur est authentifié et éventuellement ses droits à la ressource demandée
        if (user === null) {
            // window.location.href = SymfonyRouting.generate("cartesgouvfr_security_login");
            window.location.assign(SymfonyRouting.generate("cartesgouvfr_security_login"));
            return <Redirect />;
        }
    }

    let content: JSX.Element;

    switch (route.name) {
        case "home":
            content = <Home />;
            break;
        case "about":
            content = <About />;
            break;
        case "documentation":
            content = <Documentation />;
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
        case "my_account":
            content = <Me />;
            break;
        case "dashboard_pro":
            content = <DashboardPro />;
            break;
        case "datasheet_list":
            content = <DatasheetList datastoreId={route.params.datastoreId} />;
            break;
        case "datastore_create_request":
            content = <DatastoreCreationForm />;
            break;
        case "datastore_create_request_confirm":
            content = <Confirm />;
            break;
        case "join_community":
            content = <CommunityList />;
            break;
        case "datastore_datasheet_new":
            content = <DatasheetNewForm datastoreId={route.params.datastoreId} />;
            break;
        case "datastore_datasheet_new_integration":
            content = <DatasheetNewIntegrationPage datastoreId={route.params.datastoreId} uploadId={route.params.uploadId} />;
            break;
        case "datastore_datasheet_view":
            content = <DatasheetView datastoreId={route.params.datastoreId} datasheetName={route.params.datasheetName} />;
            break;
        case "datastore_stored_data_report":
            content = <StoredDataReport datastoreId={route.params.datastoreId} storedDataId={route.params.storedDataId} />;
            break;
        case "datastore_wfs_service_new":
            content = <WfsServiceNew datastoreId={route.params.datastoreId} vectorDbId={route.params.vectorDbId} />;
            break;
        case "datastore_wms_vector_service_new":
            content = <WmsVectorServiceNew datastoreId={route.params.datastoreId} vectorDbId={route.params.vectorDbId} />;
            break;
        case "datastore_pyramid_vector_new":
            content = (
                <PyramidVectorNew datastoreId={route.params.datastoreId} vectorDbId={route.params.vectorDbId} technicalName={route.params.technicalName} />
            );
            break;
        case "datastore_tms_vector_service_new":
            content = <PublishTmsServiceNew datastoreId={route.params.datastoreId} pyramidId={route.params.pyramidId} />;
            break;
        case "datastore_service_view":
            content = <ServiceView datastoreId={route.params.datastoreId} offeringId={route.params.offeringId} datasheetName={route.params.datasheetName} />;
            break;
        default:
            content = <PageNotFound />;
            break;
    }

    return (
        <Suspense
            fallback={
                <AppLayout>
                    <LoadingText />
                </AppLayout>
            }
        >
            {content}
        </Suspense>
    );
}

export default RouterRenderer;

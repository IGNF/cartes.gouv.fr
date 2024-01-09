import { FC, JSX, Suspense, lazy, useMemo } from "react";

import AppLayout from "../components/Layout/AppLayout";
import LoadingText from "../components/Utils/LoadingText";
import SymfonyRouting from "../modules/Routing";
import Home from "../pages/Home";
import RedirectToLogin from "../pages/RedirectToLogin";
import PageNotFound from "../pages/error/PageNotFound";
import { useAuthStore } from "../stores/AuthStore";
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
const Tries = lazy(() => import("../pages/Tries")); // TODO PROVISOIRE

const Me = lazy(() => import("../pages/users/Me"));

const DatastoreManageStorage = lazy(() => import("../pages/datastore/DatastoreManageStorage/DatastoreManageStorage"));

const DashboardPro = lazy(() => import("../pages/dashboard/DashboardPro"));
const DatasheetList = lazy(() => import("../pages/datasheet/DatasheetList/DatasheetList"));

const DatasheetUploadForm = lazy(() => import("../pages/datasheet/DatasheetNew/DatasheetUploadForm"));
const DatasheetUploadIntegrationPage = lazy(() => import("../pages/datasheet/DatasheetNew/DatasheetUploadIntegration/DatasheetUploadIntegrationPage"));
const DatasheetView = lazy(() => import("../pages/datasheet/DatasheetView/DatasheetView"));

const StoredDataReport = lazy(() => import("../pages/stored_data/StoredDataReport/StoredDataReport"));

const DatastoreCreationForm = lazy(() => import("../pages/contact/datastore/DatastoreCreationForm"));
const Confirm = lazy(() => import("../pages/contact/datastore/Confirmation"));

const CommunityMembers = lazy(() => import("../pages/communities/CommunityMembers"));
const CommunityList = lazy(() => import("../pages/communities/CommunityList"));

const WfsServiceNew = lazy(() => import("../pages/service/wfs/WfsServiceNew"));
const WmsVectorServiceNew = lazy(() => import("../pages/service/wms-vector/WmsVectorServiceNew"));
const PyramidVectorNew = lazy(() => import("../pages/service/tms/PyramidVectorNew"));
const PublishTmsServiceNew = lazy(() => import("../pages/service/tms/PublishNew"));

const ServiceView = lazy(() => import("../pages/service/view/ServiceView"));

const RouterRenderer: FC = () => {
    const route = useRoute();
    const user = useAuthStore((state) => state.user);

    const content: JSX.Element = useMemo(() => {
        // vérification si la route demandée est bien connue/enregistrée
        if (route.name === false || !knownRoutes.includes(route.name)) {
            return <PageNotFound />;
        }

        if (!publicRoutes.includes(route.name)) {
            // vérifier si l'utilisateur est authentifié et éventuellement ses droits à la ressource demandée
            if (user === null) {
                // window.location.href = SymfonyRouting.generate("cartesgouvfr_security_login");
                window.location.assign(SymfonyRouting.generate("cartesgouvfr_security_login"));
                return <RedirectToLogin />;
            }
        }

        switch (route.name) {
            case "home":
                return <Home />;
            case "about":
                return <About />;
            case "documentation":
                return <Documentation />;
            case "contact":
                return <Contact />;
            case "contact_thanks":
                return <Thanks />;
            case "news_list":
                return <NewsList />;
            case "news_article":
                return <NewsArticle slug={route.params.slug} />;
            case "faq":
                return <Faq />;
            case "sitemap":
                return <Sitemap />;
            case "accessibility":
                return <Accessibility />;
            case "legal_notice":
                return <LegalNotice />;
            case "personal_data":
                return <PersonalData />;
            case "my_account":
                return <Me />;
            case "datastore_manage_storage":
                return <DatastoreManageStorage datastoreId={route.params.datastoreId} />;
            case "dashboard_pro":
                return <DashboardPro />;
            case "datasheet_list":
                return <DatasheetList datastoreId={route.params.datastoreId} />;
            case "datastore_create_request":
                return <DatastoreCreationForm />;
            case "datastore_create_request_confirm":
                return <Confirm />;
            case "members_list":
                return <CommunityMembers datastoreId={route.params.datastoreId} userId={route.params.userId} />;
            case "join_community":
                return <CommunityList />;
            case "datastore_datasheet_upload":
                return <DatasheetUploadForm datastoreId={route.params.datastoreId} />;
            case "datastore_datasheet_new_integration":
                return <DatasheetUploadIntegrationPage datastoreId={route.params.datastoreId} uploadId={route.params.uploadId} />;
            case "datastore_datasheet_view":
                return <DatasheetView datastoreId={route.params.datastoreId} datasheetName={route.params.datasheetName} />;
            case "datastore_stored_data_report":
                return <StoredDataReport datastoreId={route.params.datastoreId} storedDataId={route.params.storedDataId} />;
            case "datastore_wfs_service_new":
                return <WfsServiceNew datastoreId={route.params.datastoreId} vectorDbId={route.params.vectorDbId} />;
            case "datastore_wms_vector_service_new":
                return <WmsVectorServiceNew datastoreId={route.params.datastoreId} vectorDbId={route.params.vectorDbId} />;
            case "datastore_pyramid_vector_new":
                return (
                    <PyramidVectorNew datastoreId={route.params.datastoreId} vectorDbId={route.params.vectorDbId} technicalName={route.params.technicalName} />
                );
            case "datastore_tms_vector_service_new":
                return <PublishTmsServiceNew datastoreId={route.params.datastoreId} pyramidId={route.params.pyramidId} />;
            case "datastore_service_view":
                return <ServiceView datastoreId={route.params.datastoreId} offeringId={route.params.offeringId} datasheetName={route.params.datasheetName} />;
            case "my_tries": // TODO PROVISOIRE
                return <Tries />;
            default:
                return <PageNotFound />;
        }
    }, [route, user]);

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
};

export default RouterRenderer;

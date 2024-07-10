import { FC, JSX, Suspense, lazy, useMemo } from "react";

import AppLayout from "../components/Layout/AppLayout";
import LoadingText from "../components/Utils/LoadingText";
import { useIsI18nFetching } from "../i18n/i18n";
import Home from "../pages/Home";
import RedirectToLogin from "../pages/RedirectToLogin";
import PageNotFound from "../pages/error/PageNotFound";
import { useAuthStore } from "../stores/AuthStore";
import { knownRoutes, publicRoutes, useRoute } from "./router";

const About = lazy(() => import("../pages/About"));
const Documentation = lazy(() => import("../pages/Documentation"));
const Offer = lazy(() => import("../pages/Offer"));
const Join = lazy(() => import("../pages/Join"));
const Faq = lazy(() => import("../pages/assistance/Faq"));
const Contact = lazy(() => import("../pages/assistance/contact/Contact"));
const Thanks = lazy(() => import("../pages/assistance/contact/Thanks"));
const ServiceStatus = lazy(() => import("../pages/assistance/ServiceStatus"));
const NewsList = lazy(() => import("../pages/news/NewsList"));
const NewsArticle = lazy(() => import("../pages/news/NewsArticle"));
const Sitemap = lazy(() => import("../pages/footer/Sitemap"));
const Accessibility = lazy(() => import("../pages/footer/Accessibility"));
const LegalNotice = lazy(() => import("../pages/footer/LegalNotice"));
const PersonalData = lazy(() => import("../pages/footer/PersonalData"));
const TermsOfService = lazy(() => import("../pages/footer/TermsOfService"));

const Me = lazy(() => import("../entrepot/pages/users/Me"));
const MyAccessKeys = lazy(() => import("../entrepot/pages/users/MyAccessKeys"));
const UserKeyForm = lazy(() => import("../entrepot/pages/users/keys/UserKeyForm"));

const DatastoreManageStorage = lazy(() => import("../entrepot/pages/datastore/ManageStorage/DatastoreManageStorage"));
const DatastoreManagePermissions = lazy(() => import("../entrepot/pages/datastore/ManagePermissions/DatastoreManagePermissions"));
const AddPermissionForm = lazy(() => import("../entrepot/pages/datastore/ManagePermissions/AddPermissionForm"));
const EditPermissionForm = lazy(() => import("../entrepot/pages/datastore/ManagePermissions/EditPermissionForm"));

const DashboardPro = lazy(() => import("../entrepot/pages/dashboard/DashboardPro"));
const DatasheetList = lazy(() => import("../entrepot/pages/datasheet/DatasheetList/DatasheetList"));

const DatasheetUploadForm = lazy(() => import("../entrepot/pages/datasheet/DatasheetNew/DatasheetUploadForm"));
const DatasheetUploadIntegrationPage = lazy(() => import("../entrepot/pages/datasheet/DatasheetNew/DatasheetUploadIntegration/DatasheetUploadIntegrationPage"));
const DatasheetView = lazy(() => import("../entrepot/pages/datasheet/DatasheetView/DatasheetView"));

const StoredDataDetails = lazy(() => import("../entrepot/pages/stored_data/StoredDataDetails/StoredDataDetails"));

const DatastoreCreationForm = lazy(() => import("../entrepot/pages/datastore/DatastoreCreationForm"));
const Confirm = lazy(() => import("../entrepot/pages/datastore/Confirmation"));

const CommunityMembers = lazy(() => import("../entrepot/pages/communities/CommunityMembers"));
const CommunityList = lazy(() => import("../entrepot/pages/communities/CommunityList"));

const WfsServiceForm = lazy(() => import("../entrepot/pages/service/wfs/WfsServiceForm"));
const WmsVectorServiceForm = lazy(() => import("../entrepot/pages/service/wms-vector/WmsVectorServiceForm"));
const PyramidVectorGenerateForm = lazy(() => import("../entrepot/pages/service/tms/PyramidVectorGenerateForm"));
const PyramidVectorTmsServiceForm = lazy(() => import("../entrepot/pages/service/tms/PyramidVectorTmsServiceForm"));

const ServiceView = lazy(() => import("../entrepot/pages/service/view/ServiceView"));

const EspaceCoCommunityList = lazy(() => import("../espaceco/pages/communities/Communities"));
const EspaceCoManageCommunity = lazy(() => import("../espaceco/pages/communities/ManageCommunity"));

const RouterRenderer: FC = () => {
    const route = useRoute();
    const user = useAuthStore((state) => state.user);

    const isI18nFetching = useIsI18nFetching();

    const content: JSX.Element = useMemo(() => {
        // vérification si la route demandée est bien connue/enregistrée
        if (route.name === false || !knownRoutes.includes(route.name)) {
            return <PageNotFound />;
        }

        if (!publicRoutes.includes(route.name)) {
            // vérifier si l'utilisateur est authentifié et éventuellement ses droits à la ressource demandée
            if (user === null) {
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
            case "offer":
                return <Offer />;
            case "join":
                return <Join />;
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
            case "terms_of_service":
                return <TermsOfService />;
            case "service_status":
                return <ServiceStatus />;
            case "my_account":
                return <Me />;
            case "my_access_keys":
                return <MyAccessKeys />;
            case "user_key_add":
                return <UserKeyForm />;
            case "user_key_edit":
                return <UserKeyForm keyId={route.params.keyId} />;
            // case "accesses_request":
            //     return <AccessesRequest fileIdentifier={route.params.fileIdentifier} />;
            case "datastore_manage_storage":
                return <DatastoreManageStorage datastoreId={route.params.datastoreId} />;
            case "datastore_manage_permissions":
                return <DatastoreManagePermissions datastoreId={route.params.datastoreId} />;
            case "datastore_add_permission":
                return <AddPermissionForm datastoreId={route.params.datastoreId} />;
            case "datastore_edit_permission":
                return <EditPermissionForm datastoreId={route.params.datastoreId} permissionId={route.params.permissionId} />;
            case "dashboard_pro":
                return <DashboardPro />;
            case "datasheet_list":
                return <DatasheetList datastoreId={route.params.datastoreId} />;
            case "datastore_create_request":
                return <DatastoreCreationForm />;
            case "datastore_create_request_confirm":
                return <Confirm />;
            case "members_list":
                return <CommunityMembers communityId={route.params.communityId} userId={route.params.userId} />;
            case "join_community":
                return <CommunityList />;
            case "datastore_datasheet_upload":
                return <DatasheetUploadForm datastoreId={route.params.datastoreId} />;
            case "datastore_datasheet_upload_integration":
                return <DatasheetUploadIntegrationPage datastoreId={route.params.datastoreId} uploadId={route.params.uploadId} />;
            case "datastore_datasheet_view":
                return <DatasheetView datastoreId={route.params.datastoreId} datasheetName={route.params.datasheetName} />;
            case "datastore_stored_data_details":
                return <StoredDataDetails datastoreId={route.params.datastoreId} storedDataId={route.params.storedDataId} />;
            case "datastore_wfs_service_new":
                return <WfsServiceForm datastoreId={route.params.datastoreId} vectorDbId={route.params.vectorDbId} />;
            case "datastore_wfs_service_edit":
                return <WfsServiceForm datastoreId={route.params.datastoreId} vectorDbId={route.params.vectorDbId} offeringId={route.params.offeringId} />;
            case "datastore_wms_vector_service_new":
                return <WmsVectorServiceForm datastoreId={route.params.datastoreId} vectorDbId={route.params.vectorDbId} />;
            case "datastore_wms_vector_service_edit":
                return (
                    <WmsVectorServiceForm datastoreId={route.params.datastoreId} vectorDbId={route.params.vectorDbId} offeringId={route.params.offeringId} />
                );
            case "datastore_pyramid_vector_generate":
                return (
                    <PyramidVectorGenerateForm
                        datastoreId={route.params.datastoreId}
                        vectorDbId={route.params.vectorDbId}
                        technicalName={route.params.technicalName}
                    />
                );
            case "datastore_pyramid_vector_tms_service_new":
                return <PyramidVectorTmsServiceForm datastoreId={route.params.datastoreId} pyramidId={route.params.pyramidId} />;
            case "datastore_pyramid_vector_tms_service_edit":
                return (
                    <PyramidVectorTmsServiceForm
                        datastoreId={route.params.datastoreId}
                        pyramidId={route.params.pyramidId}
                        offeringId={route.params.offeringId}
                    />
                );
            case "datastore_service_view":
                return <ServiceView datastoreId={route.params.datastoreId} offeringId={route.params.offeringId} datasheetName={route.params.datasheetName} />;
            case "espaceco_community_list":
                return <EspaceCoCommunityList />;
            case "espaceco_manage_community":
                return <EspaceCoManageCommunity communityId={route.params.communityId} />;
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
            {/* on s'assure que les textes de traductions sont chargés */}
            {isI18nFetching ? (
                <AppLayout>
                    <LoadingText />
                </AppLayout>
            ) : (
                content
            )}
        </Suspense>
    );
};

export default RouterRenderer;

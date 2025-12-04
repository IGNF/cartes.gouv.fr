import { lazy, useMemo } from "react";
import { Route } from "type-route";

import { routes } from "./router";
import AppLayout, { AppLayoutProps } from "../components/Layout/AppLayout";
import Discover from "@/pages/discover/Discover";
import PageNotFoundWithLayout from "../pages/error/PageNotFoundWithLayout";
import useNavItems from "@/hooks/useNavItems";

const DiscoverPublish = lazy(() => import("../pages/discover/publish/DiscoverPublish"));
const About = lazy(() => import("../pages/About"));
const Offer = lazy(() => import("../pages/Offer"));
const Join = lazy(() => import("../pages/Join"));
const Faq = lazy(() => import("../pages/assistance/Faq"));
const Contact = lazy(() => import("../pages/assistance/contact/Contact"));
const ContactConfirmation = lazy(() => import("../pages/assistance/contact/ContactConfirmation"));
const NewsList = lazy(() => import("../pages/news/NewsList"));
const NewsArticle = lazy(() => import("../pages/news/NewsArticle"));
const Sitemap = lazy(() => import("../pages/footer/Sitemap"));
const Accessibility = lazy(() => import("../pages/footer/Accessibility"));
const LegalNotice = lazy(() => import("../pages/footer/LegalNotice"));
const PersonalData = lazy(() => import("../pages/footer/PersonalData"));
const TermsOfService = lazy(() => import("../pages/footer/TermsOfService"));
const ServiceStatus = lazy(() => import("../pages/assistance/ServiceStatus"));
const LoginDisabled = lazy(() => import("../pages/LoginDisabled/LoginDisabled"));

const Me = lazy(() => import("../entrepot/pages/users/me/Me"));
const MyAccessKeys = lazy(() => import("../entrepot/pages/users/access-keys/MyAccessKeys"));
const UserKeyForm = lazy(() => import("../entrepot/pages/users/keys/UserKeyForm"));
// const MyDocuments = lazy(() => import("../entrepot/pages/users/documents/MyDocuments"));

const AccessesRequest = lazy(() => import("../entrepot/pages/accesses-request/AccessesRequest"));

const DatastoreCreationForm = lazy(() => import("../entrepot/pages/datastore/DatastoreCreationForm/DatastoreCreationForm"));
const DatastoreCreationRequestConfirmation = lazy(() => import("../entrepot/pages/datastore/DatastoreCreationForm/DatastoreCreationRequestConfirmation"));

const CommunityList = lazy(() => import("../entrepot/pages/communities/CommunityList/CommunityList"));

// const DashboardPro = lazy(() => import("../entrepot/pages/dashboard/DashboardPro"));
const Dashboard = lazy(() => import("../entrepot/pages/dashboard/Dashboard"));
const DatastoreSelection = lazy(() => import("../entrepot/pages/datastore/DatastoreSelection/DatastoreSelection"));

interface IGroupAppProps {
    route: Route<typeof routes>;
}

function GroupApp(props: IGroupAppProps) {
    const { route } = props;

    const navItems = useNavItems();

    const content: { render: JSX.Element; layoutProps?: AppLayoutProps } | undefined = useMemo(() => {
        switch (route.name) {
            case "home":
                routes.discover().replace();
                return {
                    render: <Discover />,
                };
            case "discover":
                return {
                    render: <Discover />,
                };
            case "discover_publish":
                return {
                    render: <DiscoverPublish />,
                };
            case "about":
                return { render: <About /> };
            case "offer":
                return { render: <Offer /> };
            case "join":
                return { render: <Join /> };
            case "contact":
                return { render: <Contact /> };
            case "contact_confirmation":
                return { render: <ContactConfirmation /> };
            case "news_list":
                return { render: <NewsList page={route.params.page} /> };
            case "news_list_by_tag":
                return { render: <NewsList page={route.params.page} tag={route.params.tag} /> };
            case "news_article":
                return { render: <NewsArticle slug={route.params.slug} /> };
            case "faq":
                return { render: <Faq /> };
            case "sitemap":
                return { render: <Sitemap /> };
            case "accessibility":
                return { render: <Accessibility /> };
            case "legal_notice":
                return { render: <LegalNotice /> };
            case "personal_data":
                return { render: <PersonalData /> };
            case "terms_of_service":
                return { render: <TermsOfService /> };
            case "service_status":
                return { render: <ServiceStatus /> };
            case "login_disabled":
                return { render: <LoginDisabled /> };
            case "my_account":
                return { render: <Me /> };
            case "my_access_keys":
                return { render: <MyAccessKeys activeTab="keys" /> };
            case "my_permissions":
                return { render: <MyAccessKeys activeTab="permissions" /> };
            case "user_key_add":
                return { render: <UserKeyForm /> };
            case "user_key_edit":
                return {
                    render: <UserKeyForm keyId={route.params.keyId} />,
                };
            // case "my_documents":
            //     return { render: <MyDocuments /> };
            case "accesses_request":
                return { render: <AccessesRequest fileIdentifier={route.params.fileIdentifier} /> };
            case "datastore_create_request":
                return { render: <DatastoreCreationForm /> };
            case "datastore_create_request_confirm":
                return {
                    render: <DatastoreCreationRequestConfirmation />,
                };
            case "join_community":
                return { render: <CommunityList /> };
            case "dashboard":
                return {
                    render: <Dashboard />,
                };
            case "datastore_selection":
                return {
                    render: <DatastoreSelection />,
                };
        }
    }, [route]);

    if (!content) {
        return <PageNotFoundWithLayout />;
    }

    return (
        <AppLayout navItems={navItems} {...content?.layoutProps}>
            {content.render}
        </AppLayout>
    );
}

export default GroupApp;

import { lazy, useMemo } from "react";
import { Route } from "type-route";

import useNavItems from "@/hooks/useNavItems";
import DiscoverPublish from "@/pages/discover/publish/DiscoverPublish";
import AppLayout, { AppLayoutProps } from "../components/Layout/AppLayout";
import PageNotFoundWithLayout from "../pages/error/PageNotFoundWithLayout";
import { routes } from "./router";

const LoginDisabled = lazy(() => import("../pages/LoginDisabled/LoginDisabled"));
const Me = lazy(() => import("../entrepot/pages/users/me/Me"));
const MyAccessKeys = lazy(() => import("../entrepot/pages/users/access-keys/MyAccessKeys"));
const UserKeyForm = lazy(() => import("../entrepot/pages/users/keys/UserKeyForm"));
// const MyDocuments = lazy(() => import("../entrepot/pages/users/documents/MyDocuments"));

const AccessesRequest = lazy(() => import("../entrepot/pages/accesses-request/AccessesRequest"));

const DatastoreAdd = lazy(() => import("../entrepot/pages/datastore/DatastoreAdd/DatastoreAdd"));

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
            case "discover_publish":
                return {
                    render: <DiscoverPublish />,
                };
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
            case "join_community":
                return { render: <DatastoreAdd /> };

            case "dashboard":
                return {
                    render: <Dashboard />,
                };
            case "datastore_selection":
                return {
                    render: <DatastoreSelection />,
                };
            case "page_not_found":
                return {
                    render: <PageNotFoundWithLayout />,
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

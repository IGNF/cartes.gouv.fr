import { lazy, useMemo } from "react";
import { Route } from "type-route";

import AppLayout from "@/components/Layout/AppLayout";
import { datastoreNavItems } from "@/config/navItems/datastoreNavItems";
import { CommunityProvider } from "@/espaceco/contexts/CommunityContext";
import PageNotFoundWithLayout from "@/pages/error/PageNotFoundWithLayout";
import { groups } from "./router";

const EspaceCoCommunityList = lazy(() => import("../espaceco/pages/communities/Communities"));
const EspaceCoCreateCommunity = lazy(() => import("../espaceco/pages/communities/CreateCommunity"));
const EspaceCoManageCommunity = lazy(() => import("../espaceco/pages/communities/ManageCommunity"));
const MemberInvitation = lazy(() => import("../espaceco/pages/communities/MemberInvitation"));

interface IGroupEspaceCoProps {
    route: Route<typeof groups.espaceco>;
}

function GroupEspaceCo(props: IGroupEspaceCoProps) {
    const { route, ...rest } = props;

    const navItems = datastoreNavItems();

    const content: { render: JSX.Element } = useMemo(() => {
        switch (route.name) {
            case "espaceco_community_list":
                return { render: <EspaceCoCommunityList /> };
            case "espaceco_create_community":
                return {
                    render: (
                        <CommunityProvider communityId={route.params.communityId} mode={"creation"}>
                            <EspaceCoCreateCommunity />
                        </CommunityProvider>
                    ),
                };
            case "espaceco_manage_community":
                return {
                    render: (
                        <CommunityProvider communityId={route.params.communityId} mode={"edition"}>
                            <EspaceCoManageCommunity />
                        </CommunityProvider>
                    ),
                };
            case "espaceco_member_invitation":
                return { render: <MemberInvitation communityId={route.params.communityId} /> };
        }
    }, [route]);

    if (!content) {
        return <PageNotFoundWithLayout />;
    }

    return (
        <AppLayout {...rest} navItems={navItems}>
            {content.render}
        </AppLayout>
    );
}

export default GroupEspaceCo;

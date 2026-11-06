import { JSX, lazy, useMemo } from "react";
import { Route } from "type-route";

import { groups } from "./router";
import CommunityLayout from "../components/Layout/CommunityLayout";
import PageNotFoundWithLayout from "../pages/error/PageNotFoundWithLayout";

const CommunityInfo = lazy(() => import("../entrepot/pages/communities/CommunityInfo/CommunityInfo"));
const CommunityMembers = lazy(() => import("../entrepot/pages/communities/CommunityMembers/CommunityMembers"));

interface IGroupCommunityProps {
    route: Route<typeof groups.community>;
}

function GroupCommunity(props: IGroupCommunityProps) {
    const { route } = props;

    const content: { render: JSX.Element } = useMemo(() => {
        switch (route.name) {
            case "community_info":
                return {
                    render: <CommunityInfo />,
                };
            case "members_list":
                return {
                    render: <CommunityMembers userId={route.params.userId} />,
                };
        }
    }, [route]);

    if (!content) {
        return <PageNotFoundWithLayout />;
    }

    return <CommunityLayout communityId={route.params.communityId}>{content.render}</CommunityLayout>;
}

export default GroupCommunity;

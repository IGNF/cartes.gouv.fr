import { lazy, useMemo } from "react";
import { Route } from "type-route";

import { groups } from "./router";
import CommunityLayout, { CommunityLayoutProps } from "../components/Layout/CommunityLayout";
import { CommunityMemberDtoRightsEnum } from "../@types/entrepot";
import PageNotFoundWithLayout from "../pages/error/PageNotFoundWithLayout";

const CommunityMembers = lazy(() => import("../entrepot/pages/communities/CommunityMembers/CommunityMembers"));

interface IGroupCommunityProps {
    route: Route<typeof groups.community>;
}

function GroupCommunity(props: IGroupCommunityProps) {
    const { route } = props;

    const content: { render: JSX.Element; layoutProps?: Omit<CommunityLayoutProps, "communityId"> } = useMemo(() => {
        switch (route.name) {
            case "members_list":
                return {
                    layoutProps: { accessRight: CommunityMemberDtoRightsEnum.COMMUNITY },
                    render: <CommunityMembers userId={route.params.userId} />,
                };
        }
    }, [route]);

    if (!content) {
        return <PageNotFoundWithLayout />;
    }

    return (
        <CommunityLayout communityId={route.params.communityId} {...content?.layoutProps}>
            {content.render}
        </CommunityLayout>
    );
}

export default GroupCommunity;

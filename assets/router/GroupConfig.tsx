import { lazy, useMemo } from "react";
import { Route } from "type-route";

import { groups } from "./router";
import PageNotFoundWithLayout from "../pages/error/PageNotFoundWithLayout";
import CommunityLayout, { CommunityLayoutProps } from "@/components/Layout/CommunityLayout";
import api from "@/entrepot/api";

const ConfigEvents = lazy(() => import("../entrepot/pages/config/Alerts"));

const { communityId } = api.alerts;

interface IGroupConfigProps {
    route: Route<typeof groups.config>;
}

function GroupConfig(props: IGroupConfigProps) {
    const { route } = props;

    const content: { render: JSX.Element; layoutProps?: Omit<CommunityLayoutProps, "communityId"> } = useMemo(() => {
        switch (route.name) {
            case "config_alerts":
                return {
                    render: <ConfigEvents />,
                };
        }
    }, [route]);

    if (!content || !communityId) {
        return <PageNotFoundWithLayout />;
    }

    return (
        <CommunityLayout communityId={communityId} {...content?.layoutProps}>
            {content.render}
        </CommunityLayout>
    );
}

export default GroupConfig;

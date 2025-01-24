import { lazy, useMemo } from "react";
import { Route } from "type-route";

import { groups } from "./router";
import DatastoreLayout, { DatastoreLayoutProps } from "../components/Layout/DatastoreLayout";
import PageNotFoundWithLayout from "../pages/error/PageNotFoundWithLayout";

const ConfigEvents = lazy(() => import("../entrepot/pages/config/Alerts"));

interface IGroupConfigProps {
    route: Route<typeof groups.config>;
}

function GroupConfig(props: IGroupConfigProps) {
    const { route } = props;

    const content: { render: JSX.Element; layoutProps?: Omit<DatastoreLayoutProps, "datastoreId"> } = useMemo(() => {
        switch (route.name) {
            case "config_alerts":
                return {
                    render: <ConfigEvents />,
                }; 
        }
    }, [route]);

    if (!content) {
        return <PageNotFoundWithLayout />;
    }

    return (
        <DatastoreLayout datastoreId="5cb4fdb0-6f6c-4422-893d-e04564bfcc10" {...content?.layoutProps}>
            {content.render}
        </DatastoreLayout>
    );
}

export default GroupConfig;

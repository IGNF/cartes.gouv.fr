import { useQuery } from "@tanstack/react-query";
import { PropsWithChildren } from "react";

import LoadingText from "@/components/Utils/LoadingText";
import { DatastoreProvider } from "@/contexts/datastore";
import { datastoreQueryOptions } from "@/hooks/queries/datastoreQueryOptions";
import useUserQuery from "@/hooks/queries/useUserQuery";
import useRequiredRights from "@/hooks/useRequiredRights";
import { isApiError } from "@/modules/apiError";
import Forbidden from "@/pages/error/Forbidden";
import PageNotFound from "@/pages/error/PageNotFound";
import { hasAccess } from "@/utils/membership";
import { useResourceStateWrapper, useTabsLayoutBelow } from "./DatastorePanelMain";

export default function DatastoreLayout({ datastoreId, children }: PropsWithChildren<{ datastoreId: string }>) {
    const { data: user } = useUserQuery();
    const requiredRights = useRequiredRights();
    const wrap = useResourceStateWrapper();
    const tabsBelow = useTabsLayoutBelow();
    const { data, error, failureReason, isFetching, isPending, status } = useQuery(datastoreQueryOptions(datastoreId));

    if (isPending) {
        return wrap(<LoadingText withSpinnerIcon />);
    }

    if ((isApiError(error) && error.status === 404) || (isApiError(failureReason) && failureReason.status === 404) || !data) {
        return <PageNotFound />;
    }

    return (
        <DatastoreProvider datastore={data} isFetching={isFetching} status={status}>
            {tabsBelow || hasAccess(user, { datastoreId }, requiredRights) ? children : wrap(<Forbidden />)}
        </DatastoreProvider>
    );
}

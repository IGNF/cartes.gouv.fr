import { PropsWithChildren } from "react";

import useUserQuery from "@/hooks/queries/useUserQuery";
import useRequiredRights from "@/hooks/useRequiredRights";
import Forbidden from "@/pages/error/Forbidden";
import { hasAccess } from "@/utils/membership";
import { useResourceStateWrapper, useTabsLayoutBelow } from "./DatastorePanelMain";

export default function DatastoreLayout({ datastoreId, children }: PropsWithChildren<{ datastoreId: string }>) {
    const { data: user } = useUserQuery();
    const requiredRights = useRequiredRights();
    const wrap = useResourceStateWrapper();
    const tabsBelow = useTabsLayoutBelow();

    return tabsBelow || hasAccess(user, { datastoreId }, requiredRights) ? children : wrap(<Forbidden />);
}

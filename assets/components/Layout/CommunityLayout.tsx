import { PropsWithChildren } from "react";

import useUserQuery from "@/hooks/queries/useUserQuery";
import useRequiredRights from "@/hooks/useRequiredRights";
import Forbidden from "@/pages/error/Forbidden";
import { hasAccess } from "@/utils/membership";
import { useResourceStateWrapper, useTabsLayoutBelow } from "./DatastorePanelMain";

export default function CommunityLayout({ communityId, children }: PropsWithChildren<{ communityId: string }>) {
    const { data: user } = useUserQuery();
    const requiredRights = useRequiredRights();
    const wrap = useResourceStateWrapper();
    const tabsBelow = useTabsLayoutBelow();

    return tabsBelow || hasAccess(user, { communityId }, requiredRights) ? children : wrap(<Forbidden />);
}

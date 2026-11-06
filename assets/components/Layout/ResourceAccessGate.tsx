import { PropsWithChildren } from "react";

import useUserQuery from "@/hooks/queries/useUserQuery";
import useRequiredRights from "@/hooks/useRequiredRights";
import Forbidden from "@/pages/error/Forbidden";
import { CommunityRef, hasAccess } from "@/utils/membership";
import { useResourceStateWrapper, useTabsLayoutBelow } from "./DatastorePanelMain";

/** refus de droits sur un entrepôt ou une communauté ; un layout d’onglets en dessous rend lui-même ce refus */
export default function ResourceAccessGate({ resource, children }: PropsWithChildren<{ resource: CommunityRef }>) {
    const { data: user } = useUserQuery();
    const requiredRights = useRequiredRights();
    const wrap = useResourceStateWrapper();
    const tabsBelow = useTabsLayoutBelow();

    return tabsBelow || hasAccess(user, resource, requiredRights) ? children : wrap(<Forbidden />);
}

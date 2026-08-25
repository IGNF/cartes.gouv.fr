import { BreadcrumbProps } from "@codegouvfr/react-dsfr/Breadcrumb";
import { use, useMemo } from "react";

import { CommunityContext } from "@/contexts/community";
import { sandboxCommunityId } from "@/env";
import { findMembership, isSandboxCommunity } from "@/utils";
import { DatastoreContext } from "../contexts/datastore";
import getBreadcrumb from "../modules/entrepot/breadcrumbs/Breadcrumb";
import { useRoute } from "../router/router";
import useUserQuery from "./queries/useUserQuery";

export default function useBreadcrumb(customBreadcrumbProps?: BreadcrumbProps) {
    const route = useRoute();
    const { datastore } = use(DatastoreContext);
    const community = use(CommunityContext);
    const { data: user } = useUserQuery();

    // flags sandbox dérivés de l’appartenance + env : le DTO ne porte plus is_sandbox
    const routeParams: Record<string, unknown> = route.params;
    const datastoreId = (typeof routeParams.datastoreId === "string" ? routeParams.datastoreId : undefined) ?? datastore?._id ?? community?.datastore?._id;
    const datastoreIsSandbox = isSandboxCommunity(findMembership(user, { datastoreId })?.community, sandboxCommunityId);
    const communityIsSandbox = isSandboxCommunity(community ?? undefined, sandboxCommunityId);

    return useMemo(() => {
        if (customBreadcrumbProps !== undefined) {
            return customBreadcrumbProps;
        }

        return getBreadcrumb(route, datastore, community, { datastoreIsSandbox, communityIsSandbox });
    }, [route, datastore, community, datastoreIsSandbox, communityIsSandbox, customBreadcrumbProps]);
}

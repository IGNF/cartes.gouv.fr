import { BreadcrumbProps } from "@codegouvfr/react-dsfr/Breadcrumb";
import { useMatches, useParams, useSearch } from "@tanstack/react-router";
import { use, useMemo } from "react";

import { CommunityContext } from "@/contexts/community";
import { DatastoreContext } from "../contexts/datastore";
import getBreadcrumb, { BreadcrumbRouteParams } from "../modules/entrepot/breadcrumbs/Breadcrumb";

export default function useBreadcrumb(customBreadcrumbProps?: BreadcrumbProps) {
    const matches = useMatches();
    const pathParams = useParams({ strict: false });
    const search: Record<string, unknown> = useSearch({ strict: false });
    const { datastore } = use(DatastoreContext);
    const community = use(CommunityContext);

    // id de la route matchée la plus profonde
    const routeId = matches[matches.length - 1]?.routeId;

    // fusion params de chemin + search (type-route fusionnait les deux dans route.params)
    const params: BreadcrumbRouteParams = useMemo(
        () => ({
            datastoreId: pathParams.datastoreId,
            communityId: pathParams.communityId !== undefined ? String(pathParams.communityId) : undefined,
            datasheetName: pathParams.datasheetName ?? (typeof search.datasheetName === "string" ? search.datasheetName : undefined),
            offeringId: pathParams.offeringId ?? (typeof search.offeringId === "string" ? search.offeringId : undefined),
        }),
        [pathParams, search]
    );

    return useMemo(() => {
        if (customBreadcrumbProps !== undefined) {
            return customBreadcrumbProps;
        }

        return getBreadcrumb(routeId, params, datastore, community);
    }, [routeId, params, datastore, community, customBreadcrumbProps]);
}

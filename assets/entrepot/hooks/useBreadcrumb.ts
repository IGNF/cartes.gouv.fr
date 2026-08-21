import { BreadcrumbProps } from "@codegouvfr/react-dsfr/Breadcrumb";
import { useQuery } from "@tanstack/react-query";
import { useMatches, useParams, useSearch } from "@tanstack/react-router";
import { use, useMemo } from "react";

import { Datastore } from "@/@types/app";
import { CommunityContext } from "@/entrepot/contexts/community";
import { sandboxCommunityId } from "@/env";
import useUserQuery from "@/hooks/queries/useUserQuery";
import { CartesApiException } from "@/modules/jsonFetch";
import { findMembership, isSandboxCommunity } from "@/utils";
import { datastoreQueryOptions } from "./queries/datastoreQueryOptions";
import getBreadcrumb, { BreadcrumbRouteParams } from "@/entrepot/modules/breadcrumbs/Breadcrumb";

export default function useBreadcrumb(customBreadcrumbProps?: BreadcrumbProps) {
    const matches = useMatches();

    const pathParams = useParams({ strict: false, shouldThrow: false });
    const search: Record<string, unknown> | undefined = useSearch({ strict: false, shouldThrow: false });
    const community = use(CommunityContext);
    const { data: user } = useUserQuery();

    // datastore courant : celui de l'URL, sinon celui de la communauté (lecture du cache, préchargé par les loaders)
    const datastoreId = pathParams?.datastoreId ?? community?.datastore?._id;
    const { data: datastore } = useQuery<Datastore, CartesApiException>(datastoreQueryOptions(datastoreId));

    const datastoreIsSandbox = isSandboxCommunity(findMembership(user, { datastoreId })?.community, sandboxCommunityId);
    const communityIsSandbox = isSandboxCommunity(community ?? undefined, sandboxCommunityId);

    // id de la route matchée la plus profonde
    const routeId = matches[matches.length - 1]?.routeId;

    // fusion params de chemin + search (type-route fusionnait les deux dans route.params)
    const params: BreadcrumbRouteParams = useMemo(
        () => ({
            datastoreId: pathParams?.datastoreId,
            communityId: pathParams?.communityId !== undefined ? String(pathParams.communityId) : undefined,
            datasheetName: pathParams?.datasheetName ?? (typeof search?.datasheetName === "string" ? search.datasheetName : undefined),
            offeringId: pathParams?.offeringId ?? (typeof search?.offeringId === "string" ? search.offeringId : undefined),
        }),
        [pathParams, search]
    );

    return useMemo(() => {
        if (customBreadcrumbProps !== undefined) {
            return customBreadcrumbProps;
        }

        return getBreadcrumb(routeId, params, datastore, community, { datastoreIsSandbox, communityIsSandbox });
    }, [routeId, params, datastore, community, datastoreIsSandbox, communityIsSandbox, customBreadcrumbProps]);
}

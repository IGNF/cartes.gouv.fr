import { BreadcrumbProps } from "@codegouvfr/react-dsfr/Breadcrumb";
import { useMatches, useParams, useSearch } from "@tanstack/react-router";
import { use, useMemo } from "react";

import { CommunityContext } from "@/contexts/community";
import { sandboxCommunityId } from "@/env";
import { stringParam } from "@/router/searchParams";
import { findMembership, isSandboxCommunity } from "@/utils";
import { DatastoreContext } from "../contexts/datastore";
import getBreadcrumb, { BreadcrumbRouteParams } from "../modules/entrepot/breadcrumbs/Breadcrumb";
import useUserQuery from "./queries/useUserQuery";

export default function useBreadcrumb(customBreadcrumbProps?: BreadcrumbProps) {
    // pas de fil d’Ariane sur une page d’erreur : ses paramètres peuvent manquer
    const routeId = useMatches({
        select: (matches) => (matches.some((match) => match.status === "error" || match.status === "notFound") ? undefined : matches.at(-1)?.routeId),
    });
    const pathParams = useParams({ strict: false });
    const search = useSearch({ strict: false });
    const { datastore } = use(DatastoreContext);
    const community = use(CommunityContext);
    const { data: user } = useUserQuery();

    // le fil d’Ariane lit les paramètres de chemin et de recherche ensemble
    const params: BreadcrumbRouteParams = useMemo(
        () => ({
            datastoreId: pathParams.datastoreId,
            communityId: pathParams.communityId !== undefined ? String(pathParams.communityId) : undefined,
            datasheetName: pathParams.datasheetName ?? stringParam(search.datasheetName),
            offeringId: pathParams.offeringId ?? stringParam(search.offeringId),
        }),
        [pathParams, search]
    );

    // flags sandbox dérivés de l’appartenance + env : le DTO ne porte plus is_sandbox
    const datastoreId = params.datastoreId ?? datastore?._id ?? community?.datastore?._id;
    const datastoreIsSandbox = isSandboxCommunity(findMembership(user, { datastoreId })?.community, sandboxCommunityId);
    const communityIsSandbox = isSandboxCommunity(community ?? undefined, sandboxCommunityId);

    return useMemo(() => {
        if (customBreadcrumbProps !== undefined) {
            return customBreadcrumbProps;
        }

        return getBreadcrumb(routeId, params, datastore, community, { datastoreIsSandbox, communityIsSandbox });
    }, [routeId, params, datastore, community, datastoreIsSandbox, communityIsSandbox, customBreadcrumbProps]);
}

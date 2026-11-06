import { BreadcrumbProps } from "@codegouvfr/react-dsfr/Breadcrumb";
import { useMatches, useParams, useSearch } from "@tanstack/react-router";
import { useMemo } from "react";

import { stringParam } from "@/router/searchParams";
import useMembership from "./useMembership";
import getBreadcrumb, { BreadcrumbRouteParams } from "../modules/entrepot/breadcrumbs/Breadcrumb";

export default function useBreadcrumb(customBreadcrumbProps?: BreadcrumbProps) {
    // pas de fil d’Ariane sur une page d’erreur : ses paramètres peuvent manquer
    const routeId = useMatches({
        select: (matches) => (matches.some((match) => match.status === "error" || match.status === "notFound") ? undefined : matches.at(-1)?.routeId),
    });
    const pathParams = useParams({ strict: false });
    const search = useSearch({ strict: false });

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

    // nom et sandbox lus dans l’appartenance, par l’entrepôt ou par la communauté de l’URL
    const membership = useMembership({ datastoreId: params.datastoreId, communityId: params.communityId });
    const community = membership?.community;
    const isSandbox = membership?.isSandbox === true;

    return useMemo(() => {
        if (customBreadcrumbProps !== undefined) {
            return customBreadcrumbProps;
        }

        return getBreadcrumb(routeId, params, community, isSandbox);
    }, [routeId, params, community, isSandbox, customBreadcrumbProps]);
}

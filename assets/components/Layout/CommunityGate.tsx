import { useQuery } from "@tanstack/react-query";
import { FC, PropsWithChildren, memo } from "react";

import { Datastore } from "../../@types/app";
import { CommunityDetailResponseDto } from "../../@types/entrepot";
import { CommunityProvider } from "../../contexts/community";
import api from "../../entrepot/api";
import { datastoreQueryOptions } from "../../hooks/queries/datastoreQueryOptions";
import useUserQuery from "../../hooks/queries/useUserQuery";
import useRequiredRights from "../../hooks/useRequiredRights";
import RQKeys from "../../modules/entrepot/RQKeys";
import { CartesApiException } from "../../modules/jsonFetch";
import Forbidden from "../../pages/error/Forbidden";
import PageNotFound from "../../pages/error/PageNotFound";
import UnexpectedError from "../../pages/error/UnexpectedError";
import { hasAccess } from "../../utils";
import { delta } from "../../utils/delta";
import LoadingText from "../Utils/LoadingText";
import Main from "./Main";

export interface CommunityGateProps {
    communityId: string;
}

/**
 * Gate + contexte des pages communauté (portage de CommunityLayout, sans AppLayout — fourni par le layout _private).
 * Fetch communauté + datastore éventuel, partition d'erreurs miroir-404, providers, droits (staticData).
 */
const CommunityGate: FC<PropsWithChildren<CommunityGateProps>> = ({ communityId, children }) => {
    const communityQuery = useQuery<CommunityDetailResponseDto, CartesApiException>({
        queryKey: RQKeys.community(communityId),
        queryFn: ({ signal }) => api.community.get(communityId, { signal }),
        staleTime: delta.seconds(20),
        enabled: !!communityId,
    });
    const community = communityQuery.data;

    // requête dépendante : le datastore éventuel de la communauté (une communauté peut ne pas en avoir)
    const datastoreId = community?.datastore?._id;
    const datastoreQuery = useQuery<Datastore, CartesApiException>(datastoreQueryOptions(datastoreId));

    // une requête désactivée n'a ni data ni erreur ; seul isPending doit être conditionné
    const error = communityQuery.error ?? datastoreQuery.error;
    const failureReason = communityQuery.failureReason ?? datastoreQuery.failureReason;
    const isPending = communityQuery.isPending || (datastoreId !== undefined && datastoreQuery.isPending);

    const { data: user } = useUserQuery();
    const requiredRights = useRequiredRights();

    if (isPending) {
        return (
            <Main>
                <LoadingText withSpinnerIcon />
            </Main>
        );
    }

    // 404 : ressource inexistante OU inaccessible (l'API Entrepôt répond 404 dans les deux cas, comportement miroir voulu)
    if (error?.code === 404 || failureReason?.code === 404) {
        return <PageNotFound />;
    }

    // toute autre erreur (500, réseau...) n'est PAS une 404
    if (error || !community) {
        return (
            <UnexpectedError
                message={error?.message}
                onRetry={() => {
                    if (communityQuery.error) communityQuery.refetch();
                    if (datastoreQuery.error) datastoreQuery.refetch();
                }}
            />
        );
    }

    return <CommunityProvider community={community}>{hasAccess(user, { communityId }, requiredRights) ? children : <Forbidden />}</CommunityProvider>;
};

export default memo(CommunityGate);

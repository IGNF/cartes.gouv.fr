import { useQuery } from "@tanstack/react-query";
import { FC, PropsWithChildren, memo } from "react";

import { datastoreQueryOptions } from "@/hooks/queries/datastoreQueryOptions";
import useAccessGate from "@/hooks/useAccessGate";
import { delta } from "@/utils/delta";
import { Datastore } from "../../@types/app";
import { CommunityDetailResponseDto, CommunityMemberDtoRightsEnum } from "../../@types/entrepot";
import { CommunityProvider } from "../../contexts/community";
import { DatastoreProvider } from "../../contexts/datastore";
import api from "../../entrepot/api";
import RQKeys from "../../modules/entrepot/RQKeys";
import { CartesApiException } from "../../modules/jsonFetch";
import Forbidden from "../../pages/error/Forbidden";
import PageNotFoundWithLayout from "../../pages/error/PageNotFoundWithLayout";
import UnexpectedError from "../../pages/error/UnexpectedError";
import LoadingText from "../Utils/LoadingText";
import AppLayout from "./AppLayout";
import { DatastoreLayoutProps } from "./DatastoreLayout";
import Main from "./Main";

export interface CommunityLayoutProps extends Omit<DatastoreLayoutProps, "datastoreId"> {
    requiredRights?: CommunityMemberDtoRightsEnum[];
    communityId: string;
}

const CommunityLayout: FC<PropsWithChildren<CommunityLayoutProps>> = (props) => {
    const { requiredRights, children, communityId, ...rest } = props;

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
    const datastore = datastoreQuery.data;

    // une requête désactivée n'a ni data ni erreur ; seul isPending doit être conditionné
    const error = communityQuery.error ?? datastoreQuery.error;
    const failureReason = communityQuery.failureReason ?? datastoreQuery.failureReason;
    const isPending = communityQuery.isPending || (datastoreId !== undefined && datastoreQuery.isPending);

    const gate = useAccessGate({ communityId }, requiredRights);

    if (isPending || gate === "checking") {
        return (
            <AppLayout {...rest}>
                <Main>
                    <LoadingText withSpinnerIcon />
                </Main>
            </AppLayout>
        );
    }

    // 404 : ressource inexistante OU inaccessible (l'API Entrepôt répond 404 dans les deux cas, comportement miroir voulu)
    if (error?.code === 404 || failureReason?.code === 404) {
        return <PageNotFoundWithLayout />;
    }

    // toute autre erreur (500, réseau...) n'est PAS une 404
    if (error || !community) {
        return (
            <AppLayout {...rest}>
                <UnexpectedError
                    message={error?.message}
                    onRetry={() => {
                        if (communityQuery.error) communityQuery.refetch();
                        if (datastoreQuery.error) datastoreQuery.refetch();
                    }}
                />
            </AppLayout>
        );
    }

    return (
        <AppLayout {...rest}>
            <CommunityProvider community={community}>
                <DatastoreProvider
                    datastore={datastore}
                    isFetching={communityQuery.isFetching || datastoreQuery.isFetching}
                    status={datastoreId !== undefined ? datastoreQuery.status : "success"}
                >
                    {gate === "granted" ? children : <Forbidden />}
                </DatastoreProvider>
            </CommunityProvider>
        </AppLayout>
    );
};

export default memo(CommunityLayout);

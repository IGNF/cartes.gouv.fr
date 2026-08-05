import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, PropsWithChildren, memo, useMemo } from "react";

import useUserQuery from "@/hooks/queries/useUserQuery";
import { canUserAccess, findMembership } from "@/utils";
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
    accessRight?: CommunityMemberDtoRightsEnum | CommunityMemberDtoRightsEnum[];
    communityId: string;
}

const CommunityLayout: FC<PropsWithChildren<CommunityLayoutProps>> = (props) => {
    const { accessRight, children, communityId, ...rest } = props;

    const { data: user } = useUserQuery();
    const queryClient = useQueryClient();

    const { data, error, failureReason, isFetching, isPending, refetch, status } = useQuery<
        [CommunityDetailResponseDto, Datastore | undefined],
        CartesApiException
    >({
        queryKey: RQKeys.community(communityId),
        queryFn: async ({ signal }) => {
            const community = await api.community.get(communityId, { signal });
            let datastore: Datastore | undefined;
            if (community.datastore !== undefined && community.datastore._id) {
                const datastoreId = community.datastore._id;
                datastore = await queryClient.ensureQueryData({
                    queryKey: RQKeys.datastore(datastoreId),
                    queryFn: () => api.datastore.get(datastoreId, { signal }),
                    revalidateIfStale: true,
                });
            }
            return [community, datastore];
        },
        staleTime: 20000,
        enabled: !!communityId,
    });

    const [community, datastore] = data ?? [];

    const isAuthorized = useMemo(() => {
        if (!user?.id) {
            return false;
        }
        const membership = findMembership(user, { communityId });
        if (!membership) {
            return false; // n'est pas membre de la communauté
        }
        return canUserAccess(user.id, membership, accessRight) === true;
    }, [accessRight, user, communityId]);

    if (isPending) {
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
                <UnexpectedError message={error?.message} onRetry={() => refetch()} />
            </AppLayout>
        );
    }

    return (
        <AppLayout {...rest}>
            <CommunityProvider community={community}>
                <DatastoreProvider datastore={datastore} isFetching={isFetching} status={status}>
                    {isAuthorized ? children : <Forbidden />}
                </DatastoreProvider>
            </CommunityProvider>
        </AppLayout>
    );
};

export default memo(CommunityLayout);

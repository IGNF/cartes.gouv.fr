import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, PropsWithChildren, memo, useMemo } from "react";

import useUserQuery from "@/hooks/queries/useUserQuery";
import { canUserAccess } from "@/utils";
import { Datastore } from "../../@types/app";
import { CommunityDetailResponseDto, CommunityMemberDtoRightsEnum } from "../../@types/entrepot";
import { CommunityProvider } from "../../contexts/community";
import { DatastoreProvider } from "../../contexts/datastore";
import api from "../../entrepot/api";
import RQKeys from "../../modules/entrepot/RQKeys";
import { CartesApiException } from "../../modules/jsonFetch";
import Forbidden from "../../pages/error/Forbidden";
import PageNotFoundWithLayout from "../../pages/error/PageNotFoundWithLayout";
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

    const { data, error, failureReason, isFetching, isLoading, status } = useQuery<[CommunityDetailResponseDto, Datastore | undefined], CartesApiException>({
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
        if (!user?.id || !user?.communities_member) {
            return false;
        }
        const communityMember = user.communities_member.find((member) => member.community?._id === communityId);
        if (!communityMember) {
            return false; // is not part of the community
        }
        return canUserAccess(user.id, communityMember, accessRight);
    }, [accessRight, user?.communities_member, communityId, user?.id]);

    if (isLoading) {
        return (
            <AppLayout {...rest}>
                <Main>
                    <LoadingText withSpinnerIcon />
                </Main>
            </AppLayout>
        );
    }

    if (error?.code === 404 || failureReason?.code === 404 || !community) {
        return <PageNotFoundWithLayout />;
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

import { useQuery } from "@tanstack/react-query";
import { FC, PropsWithChildren, memo, useMemo } from "react";

import { datastoreQueryOptions } from "@/hooks/queries/datastoreQueryOptions";
import useUserQuery from "@/hooks/queries/useUserQuery";
import { canUserAccess } from "@/utils";
import { delta } from "@/utils/delta";
import { CommunityMemberDtoRightsEnum } from "../../@types/entrepot";
import { CommunityProvider } from "../../contexts/community";
import { DatastoreProvider } from "../../contexts/datastore";
import api from "../../entrepot/api";
import RQKeys from "../../modules/entrepot/RQKeys";
import { isApiError } from "../../modules/apiError";
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
    const communityQuery = useQuery({
        queryKey: RQKeys.community(communityId),
        queryFn: ({ signal }) => api.community.get(communityId, { signal }),
        staleTime: delta.seconds(20),
        enabled: !!communityId,
    });
    const community = communityQuery.data;

    // requête dépendante : le datastore éventuel de la communauté (une communauté peut ne pas en avoir)
    const datastoreId = community?.datastore?._id;
    const datastoreQuery = useQuery(datastoreQueryOptions(datastoreId));
    const datastore = datastoreQuery.data;

    // une requête désactivée n’a ni data ni erreur, et isLoading reste faux tant qu’elle ne charge pas
    const error = communityQuery.error ?? datastoreQuery.error;
    const failureReason = communityQuery.failureReason ?? datastoreQuery.failureReason;
    const isLoading = communityQuery.isLoading || datastoreQuery.isLoading;

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

    if (
        (isApiError(error) && error.status === 404) ||
        (isApiError(failureReason) && failureReason.status === 404) ||
        !community ||
        (datastoreId !== undefined && !datastore)
    ) {
        return <PageNotFoundWithLayout />;
    }

    return (
        <AppLayout {...rest}>
            <CommunityProvider community={community}>
                <DatastoreProvider
                    datastore={datastore}
                    isFetching={communityQuery.isFetching || datastoreQuery.isFetching}
                    status={datastoreId !== undefined ? datastoreQuery.status : communityQuery.status}
                >
                    {isAuthorized ? children : <Forbidden />}
                </DatastoreProvider>
            </CommunityProvider>
        </AppLayout>
    );
};

export default memo(CommunityLayout);

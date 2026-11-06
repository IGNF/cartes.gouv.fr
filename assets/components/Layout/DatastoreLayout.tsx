import { useQuery } from "@tanstack/react-query";
import { FC, PropsWithChildren, memo, useMemo } from "react";

import { datastoreQueryOptions } from "@/hooks/queries/datastoreQueryOptions";
import useUserQuery from "@/hooks/queries/useUserQuery";
import { canUserAccess } from "@/utils";
import { CommunityMemberDtoRightsEnum } from "../../@types/entrepot";
import { DatastoreProvider } from "../../contexts/datastore";
import { isApiError } from "../../modules/apiError";
import Forbidden from "../../pages/error/Forbidden";
import PageNotFoundWithLayout from "../../pages/error/PageNotFoundWithLayout";
import LoadingText from "../Utils/LoadingText";
import AppLayout, { AppLayoutProps } from "./AppLayout";
import Main from "./Main";

export interface DatastoreLayoutProps extends Omit<AppLayoutProps, "navItems"> {
    accessRight?: CommunityMemberDtoRightsEnum | CommunityMemberDtoRightsEnum[];
    datastoreId: string;
}
const DatastoreLayout: FC<PropsWithChildren<DatastoreLayoutProps>> = (props) => {
    const { accessRight, datastoreId, children, ...rest } = props;

    const { data: user } = useUserQuery();
    const { data, error, failureReason, isFetching, isLoading, isPending, status } = useQuery(datastoreQueryOptions(datastoreId));

    const isAuthorized = useMemo(() => {
        if (!user?.id || !user?.communities_member) {
            return false;
        }
        const communityMember = user.communities_member.find((member) => member.community?.datastore === datastoreId);
        if (!communityMember) {
            return false; // is not part of the community
        }
        return canUserAccess(user.id, communityMember, accessRight);
    }, [accessRight, user?.communities_member, datastoreId, user?.id]);

    if (isLoading || isPending) {
        return (
            <AppLayout {...rest}>
                <Main>
                    <LoadingText withSpinnerIcon />
                </Main>
            </AppLayout>
        );
    }

    if ((isApiError(error) && error.status === 404) || (isApiError(failureReason) && failureReason.status === 404) || !data) {
        return <PageNotFoundWithLayout />;
    }

    return (
        <AppLayout {...rest}>
            <DatastoreProvider datastore={data} isFetching={isFetching} status={status}>
                {isAuthorized ? children : <Forbidden />}
            </DatastoreProvider>
        </AppLayout>
    );
};

export default memo(DatastoreLayout);

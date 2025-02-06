import { useQuery } from "@tanstack/react-query";
import { FC, PropsWithChildren, memo, useMemo } from "react";

import { Datastore } from "../../@types/app";
import { datastoreNavItems } from "../../config/navItems/datastoreNavItems";
import api from "../../entrepot/api";
import RQKeys from "../../modules/entrepot/RQKeys";
import { CartesApiException } from "../../modules/jsonFetch";
import AppLayout, { AppLayoutProps } from "./AppLayout";
import { DatastoreProvider } from "../../contexts/datastore";
import LoadingText from "../Utils/LoadingText";
import PageNotFoundWithLayout from "../../pages/error/PageNotFoundWithLayout";
import { useAuthStore } from "../../stores/AuthStore";
import Main from "./Main";
import { CommunityMemberDtoRightsEnum } from "../../@types/entrepot";
import Forbidden from "../../pages/error/Forbidden";
import { canUserAccess } from "@/utils";

export interface DatastoreLayoutProps extends Omit<AppLayoutProps, "navItems"> {
    accessRight?: CommunityMemberDtoRightsEnum | CommunityMemberDtoRightsEnum[];
    datastoreId: string;
}
const DatastoreLayout: FC<PropsWithChildren<DatastoreLayoutProps>> = (props) => {
    const { accessRight, datastoreId, children, ...rest } = props;

    const { user } = useAuthStore();
    const { data, error, failureReason, isFetching, isLoading, status } = useQuery<Datastore, CartesApiException>({
        queryKey: RQKeys.datastore(datastoreId),
        queryFn: ({ signal }) => api.datastore.get(datastoreId, { signal }),
        staleTime: 3600000,
    });

    const navItems = useMemo(() => datastoreNavItems(data), [data]);

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

    if (isLoading) {
        return (
            <AppLayout {...rest}>
                <Main>
                    <LoadingText withSpinnerIcon />
                </Main>
            </AppLayout>
        );
    }

    if (error?.code === 404 || failureReason?.code === 404 || !data) {
        return <PageNotFoundWithLayout />;
    }

    return (
        <AppLayout {...rest} navItems={navItems}>
            <DatastoreProvider datastore={data} isFetching={isFetching} status={status}>
                {isAuthorized ? children : <Forbidden />}
            </DatastoreProvider>
        </AppLayout>
    );
};

export default memo(DatastoreLayout);

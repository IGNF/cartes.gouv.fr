import { useQuery } from "@tanstack/react-query";
import { FC, PropsWithChildren, memo, useMemo } from "react";

import useUserQuery from "@/hooks/queries/useUserQuery";
import { canUserAccess, findMembership } from "@/utils";
import { Datastore } from "../../@types/app";
import { CommunityMemberDtoRightsEnum } from "../../@types/entrepot";
import { DatastoreProvider } from "../../contexts/datastore";
import api from "../../entrepot/api";
import RQKeys from "../../modules/entrepot/RQKeys";
import { CartesApiException } from "../../modules/jsonFetch";
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
    const { data, error, failureReason, isFetching, isLoading, isPending, status } = useQuery<Datastore, CartesApiException>({
        queryKey: RQKeys.datastore(datastoreId),
        queryFn: ({ signal }) => api.datastore.get(datastoreId, { signal }),
        staleTime: 3600000,
    });

    const isAuthorized = useMemo(() => {
        if (!user?.id) {
            return false;
        }
        const membership = findMembership(user, { datastoreId });
        if (!membership) {
            return false; // n'est pas membre de la communauté
        }
        return canUserAccess(user.id, membership, accessRight) === true;
    }, [accessRight, user, datastoreId]);

    if (isLoading || isPending) {
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
        <AppLayout {...rest}>
            <DatastoreProvider datastore={data} isFetching={isFetching} status={status}>
                {isAuthorized ? children : <Forbidden />}
            </DatastoreProvider>
        </AppLayout>
    );
};

export default memo(DatastoreLayout);

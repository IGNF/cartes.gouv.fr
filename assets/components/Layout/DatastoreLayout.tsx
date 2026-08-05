import { useQuery } from "@tanstack/react-query";
import { FC, PropsWithChildren, memo, useMemo } from "react";

import useUserQuery from "@/hooks/queries/useUserQuery";
import useRevalidateUserOnDenial from "@/hooks/useRevalidateUserOnDenial";
import { canUserAccess, findMembership } from "@/utils";
import { Datastore } from "../../@types/app";
import { CommunityMemberDtoRightsEnum } from "../../@types/entrepot";
import { DatastoreProvider } from "../../contexts/datastore";
import api from "../../entrepot/api";
import RQKeys from "../../modules/entrepot/RQKeys";
import { CartesApiException } from "../../modules/jsonFetch";
import Forbidden from "../../pages/error/Forbidden";
import PageNotFoundWithLayout from "../../pages/error/PageNotFoundWithLayout";
import UnexpectedError from "../../pages/error/UnexpectedError";
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
    const { data, error, failureReason, isFetching, isPending, refetch, status } = useQuery<Datastore, CartesApiException>({
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

    const denialSettled = useRevalidateUserOnDenial(!isAuthorized, datastoreId);

    if (isPending || (!isAuthorized && !denialSettled)) {
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
    if (error || !data) {
        return (
            <AppLayout {...rest}>
                <UnexpectedError message={error?.message} onRetry={() => refetch()} />
            </AppLayout>
        );
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

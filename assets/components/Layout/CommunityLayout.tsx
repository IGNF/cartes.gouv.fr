import { useQuery } from "@tanstack/react-query";
import { PropsWithChildren } from "react";

import LoadingText from "@/components/Utils/LoadingText";
import { CommunityProvider } from "@/contexts/community";
import { DatastoreProvider } from "@/contexts/datastore";
import api from "@/entrepot/api";
import { datastoreQueryOptions } from "@/hooks/queries/datastoreQueryOptions";
import useUserQuery from "@/hooks/queries/useUserQuery";
import useRequiredRights from "@/hooks/useRequiredRights";
import { isApiError } from "@/modules/apiError";
import RQKeys from "@/modules/entrepot/RQKeys";
import Forbidden from "@/pages/error/Forbidden";
import PageNotFound from "@/pages/error/PageNotFound";
import { delta } from "@/utils/delta";
import { hasAccess } from "@/utils/membership";
import { useResourceStateWrapper } from "./DatastorePanelMain";

export default function CommunityLayout({ communityId, children }: PropsWithChildren<{ communityId: string }>) {
    const { data: user } = useUserQuery();
    const requiredRights = useRequiredRights();
    const wrap = useResourceStateWrapper();

    const communityQuery = useQuery({
        queryKey: RQKeys.community(communityId),
        queryFn: ({ signal }) => api.community.get(communityId, { signal }),
        staleTime: delta.seconds(20),
    });
    const community = communityQuery.data;

    // requête dépendante : le datastore éventuel de la communauté (une communauté peut ne pas en avoir)
    const datastoreId = community?.datastore?._id;
    const datastoreQuery = useQuery(datastoreQueryOptions(datastoreId));
    const datastore = datastoreQuery.data;

    // une requête désactivée n’a ni data ni erreur et reste pending : ne la compter que si elle a un id
    const error = communityQuery.error ?? datastoreQuery.error;
    const failureReason = communityQuery.failureReason ?? datastoreQuery.failureReason;
    const isPending = communityQuery.isPending || (datastoreId !== undefined && datastoreQuery.isPending);

    if (isPending) {
        return wrap(<LoadingText withSpinnerIcon />);
    }

    if (
        (isApiError(error) && error.status === 404) ||
        (isApiError(failureReason) && failureReason.status === 404) ||
        !community ||
        (datastoreId !== undefined && !datastore)
    ) {
        return <PageNotFound />;
    }

    return (
        <CommunityProvider community={community}>
            <DatastoreProvider
                datastore={datastore}
                isFetching={communityQuery.isFetching || datastoreQuery.isFetching}
                status={datastoreId !== undefined ? datastoreQuery.status : communityQuery.status}
            >
                {hasAccess(user, { communityId }, requiredRights) ? children : wrap(<Forbidden />)}
            </DatastoreProvider>
        </CommunityProvider>
    );
}

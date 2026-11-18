import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { Pagination } from "@codegouvfr/react-dsfr/Pagination";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { FC, useMemo } from "react";

import SidePanelPage from "@/components/Layout/SidePanelPage";
import { CommunityListFilter, GetResponse } from "../../../@types/app_espaceco";
import { CommunityResponseDTO } from "../../../@types/espaceco";
import { useTranslation } from "../../../i18n/i18n";
import RQKeys from "../../../modules/espaceco/RQKeys";
import { ApiError } from "../../../modules/jsonFetch";
import { getApiErrorTitle, getApiErrorDescription } from "../../../modules/apiError";
import { searchAwareActiveOptions } from "@/router/AppLink";
import api from "../../api";
import CommunityList from "./CommunityList";
import Skeleton from "../../../components/Utils/Skeleton";

const routeApi = getRouteApi("/_private/contribuer-aux-donnees/guichets/_panneau/");

const defaultLimit = 10;

type QueryParamsType = {
    page: number;
    limit: number;
    pending?: boolean;
};

// page de guichets affichée, quelle que soit la requête active ; pagination seulement à partir de deux pages
type CommunityPage = {
    communities: CommunityResponseDTO[];
    totalPages?: number;
};

const toCommunityPage = (data: GetResponse<CommunityResponseDTO>): CommunityPage => ({
    communities: data.content,
    totalPages: data.totalPages,
});

const Communities: FC = () => {
    const { page, filter, community } = routeApi.useSearch();

    const { t } = useTranslation("EspaceCoCommunityList");

    const queryParams = useMemo<QueryParamsType>(() => {
        const params: QueryParamsType = { page: page, limit: defaultLimit };
        if (["iam_member", "affiliation"].includes(filter)) {
            params["pending"] = filter === "iam_member" ? false : true;
        }
        return params;
    }, [page, filter]);

    const communityQuery = useQuery<GetResponse<CommunityResponseDTO>, ApiError, CommunityPage>({
        queryKey: RQKeys.communityList(queryParams),
        queryFn: ({ signal }) => api.community.get(queryParams, signal),
        staleTime: 3600000,
        select: toCommunityPage,
        enabled: community === undefined && filter === "listed",
    });

    const communitiesAsMemberQuery = useQuery<GetResponse<CommunityResponseDTO>, ApiError, CommunityPage>({
        queryKey: RQKeys.communitiesAsMember(queryParams),
        queryFn: ({ signal }) => api.community.getAsMember(queryParams, signal),
        staleTime: 3600000,
        select: toCommunityPage,
        enabled: community === undefined && (filter === "iam_member" || filter === "affiliation"),
    });

    return (
        <SidePanelPage title={t("title")}>
            {community !== undefined ? (
                <SearchedCommunity communityId={community} filter={filter} />
            ) : (
                <CommunityPageView
                    query={filter === "listed" ? communityQuery : communitiesAsMemberQuery}
                    filter={filter}
                    page={queryParams.page}
                    skeletonCount={defaultLimit}
                />
            )}
        </SidePanelPage>
    );
};

const SearchedCommunity: FC<{ communityId: number; filter: CommunityListFilter }> = ({ communityId, filter }) => {
    const query = useQuery<CommunityResponseDTO, ApiError, CommunityPage>({
        queryKey: RQKeys.community(communityId),
        queryFn: ({ signal }) => api.community.getCommunity(communityId, signal),
        staleTime: 3600000,
        select: (community) => ({ communities: [community] }),
    });

    return <CommunityPageView query={query} filter={filter} skeletonCount={1} />;
};

type CommunityPageViewProps = {
    query: UseQueryResult<CommunityPage, ApiError>;
    filter: CommunityListFilter;
    page?: number;
    skeletonCount: number;
};

const CommunityPageView: FC<CommunityPageViewProps> = ({ query, filter, page, skeletonCount }) => {
    const { t } = useTranslation("EspaceCoCommunityList");

    if (query.isError) {
        return <Alert severity="error" closable={false} title={getApiErrorTitle(query.error)} description={getApiErrorDescription(query.error)} />;
    }

    if (query.isLoading) {
        return <Skeleton count={skeletonCount} rectangleHeight={200} />;
    }

    if (!query.data?.communities.length) {
        return (
            <div className={fr.cx("fr-my-2v")}>
                <Alert severity={"info"} title={t("no_result", { filter: filter })} closable />
            </div>
        );
    }

    const { communities, totalPages } = query.data;

    return (
        <div>
            <CommunityList communities={communities} />
            {totalPages !== undefined && totalPages > 1 && (
                <div className={fr.cx("fr-grid-row", "fr-grid-row--center", "fr-mt-6v")}>
                    <Pagination
                        count={totalPages}
                        defaultPage={page}
                        getPageLinkProps={(pageNumber) => ({
                            to: "/contribuer-aux-donnees/guichets",
                            search: { filter, page: pageNumber },
                            activeOptions: searchAwareActiveOptions,
                        })}
                    />
                </div>
            )}
        </div>
    );
};

export default Communities;

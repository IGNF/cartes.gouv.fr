import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { Pagination } from "@codegouvfr/react-dsfr/Pagination";
import { useQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { FC, useMemo } from "react";

import SidePanelPage from "@/components/Layout/SidePanelPage";
import { GetResponse } from "../../../@types/app_espaceco";
import { CommunityResponseDTO } from "../../../@types/espaceco";
import Skeleton from "../../../components/Utils/Skeleton";
import { useTranslation } from "../../../i18n/i18n";
import RQKeys from "../../../modules/espaceco/RQKeys";
import { ApiError } from "../../../modules/jsonFetch";
import { getApiErrorTitle, getApiErrorDescription } from "../../../modules/apiError";
import { searchAwareActiveOptions } from "@/router/AppLink";
import api from "../../api";
import CommunityList from "./CommunityList";

const routeApi = getRouteApi("/_private/contribuer-aux-donnees/guichets/_panneau/");

const defaultLimit = 10;

type QueryParamsType = {
    page: number;
    limit: number;
    pending?: boolean;
};

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

    const communityQuery = useQuery<GetResponse<CommunityResponseDTO>, ApiError>({
        queryKey: RQKeys.communityList(queryParams),
        queryFn: ({ signal }) => api.community.get(queryParams, signal),
        staleTime: 3600000,
        enabled: community === undefined && filter === "listed",
    });

    const communitiesAsMemberQuery = useQuery<GetResponse<CommunityResponseDTO>, ApiError>({
        queryKey: RQKeys.communitiesAsMember(queryParams),
        queryFn: ({ signal }) => api.community.getAsMember(queryParams, signal),
        staleTime: 3600000,
        enabled: community === undefined && (filter === "iam_member" || filter === "affiliation"),
    });

    if (community !== undefined) {
        return (
            <SidePanelPage title={t("title")}>
                <SearchedCommunity communityId={community} />
            </SidePanelPage>
        );
    }

    return (
        <SidePanelPage title={t("title")}>
            {communityQuery.isError && (
                <Alert
                    severity="error"
                    closable={false}
                    title={getApiErrorTitle(communityQuery.error)}
                    description={getApiErrorDescription(communityQuery.error)}
                />
            )}
            {communitiesAsMemberQuery.isError && (
                <Alert
                    severity="error"
                    closable={false}
                    title={getApiErrorTitle(communitiesAsMemberQuery.error)}
                    description={getApiErrorDescription(communitiesAsMemberQuery.error)}
                />
            )}
            {communityQuery.isLoading || communitiesAsMemberQuery.isLoading ? (
                <Skeleton count={10} />
            ) : filter === "listed" ? (
                communityQuery.data && communityQuery.data.content.length ? (
                    <div>
                        <CommunityList communities={communityQuery.data.content} />
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--center")}>
                            <Pagination
                                count={communityQuery.data.totalPages}
                                defaultPage={queryParams.page}
                                getPageLinkProps={(pageNumber) => ({
                                    to: "/contribuer-aux-donnees/guichets",
                                    search: { filter, page: pageNumber },
                                    activeOptions: searchAwareActiveOptions,
                                })}
                            />
                        </div>
                    </div>
                ) : (
                    <div className={fr.cx("fr-my-2v")}>
                        <Alert severity={"info"} title={t("no_result", { filter: filter })} closable />
                    </div>
                )
            ) : communitiesAsMemberQuery.data && communitiesAsMemberQuery.data.content.length ? (
                <div>
                    <CommunityList communities={communitiesAsMemberQuery.data.content} />
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--center")}>
                        <Pagination
                            count={communitiesAsMemberQuery.data.totalPages}
                            defaultPage={queryParams.page}
                            getPageLinkProps={(pageNumber) => ({
                                to: "/contribuer-aux-donnees/guichets",
                                search: { filter, page: pageNumber },
                                activeOptions: searchAwareActiveOptions,
                            })}
                        />
                    </div>
                </div>
            ) : (
                <div className={fr.cx("fr-my-2v")}>
                    <Alert severity={"info"} title={t("no_result", { filter: filter })} closable />
                </div>
            )}
        </SidePanelPage>
    );
};

const SearchedCommunity: FC<{ communityId: number }> = ({ communityId }) => {
    const query = useQuery<CommunityResponseDTO, ApiError>({
        queryKey: RQKeys.community(communityId),
        queryFn: ({ signal }) => api.community.getCommunity(communityId, signal),
        staleTime: 3600000,
    });

    if (query.isError) {
        return <Alert severity="error" closable={false} title={getApiErrorTitle(query.error)} description={getApiErrorDescription(query.error)} />;
    }

    return query.data ? <CommunityList communities={[query.data]} /> : <Skeleton count={1} />;
};

export default Communities;

import { fr } from "@codegouvfr/react-dsfr";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import MuiDsfrThemeProvider from "@codegouvfr/react-dsfr/mui";
import { Skeleton } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { FC, useState } from "react";
import { CommunityListFilter, GetResponse } from "../../../@types/app_espaceco";
import { CommunityResponseDTO } from "../../../@types/espaceco";
import Pagination from "../../../components/Utils/Pagination";
import RQKeys from "../../../modules/espaceco/RQKeys";
import { CartesApiException } from "../../../modules/jsonFetch";
import api from "../../api";
import CommunityList from "./CommunityList";
import { useTranslation } from "../../../i18n/i18n";
import Alert from "@codegouvfr/react-dsfr/Alert";
import SearchCommunity from "./SearchCommunity";

const defaultLimit = 10;

type commonParams = {
    page: number;
    limit: number;
};

type Pending = commonParams & { pending: boolean };

const Communities: FC = () => {
    const { t } = useTranslation("EspaceCoCommunities");

    const [filter, setFilter] = useState<CommunityListFilter>("public");

    const [params, setParams] = useState<commonParams>({ page: 1, limit: defaultLimit });
    const [communitiesAsMemberParams, setCommunitiesAsMemberParams] = useState<Pending>({ pending: false, page: 1, limit: defaultLimit });

    const [community, setCommunity] = useState<CommunityResponseDTO | null>(null);

    // const { data /*, isError, error*/ } = useInfiniteQuery<
    //     GetResponse<CommunityResponseDTO>,
    //     CartesApiException,
    //     InfiniteData<GetResponse<CommunityResponseDTO>, number>,
    //     string[],
    //     number
    // >({
    //     queryKey: RQKeys.community_list("", page, limit),
    //     queryFn: ({ pageParam, signal }) => api.community.get(pageParam, limit, signal),
    //     initialPageParam: 1,
    //     getNextPageParam: (lastPage /*, allPages, lastPageParam, allPageParams*/) => lastPage.nextPage,
    //     getPreviousPageParam: (firstPage /*, allPages, firstPageParam, allPageParams*/) => firstPage.previousPage,
    // });

    const communityQuery = useQuery<GetResponse<CommunityResponseDTO>, CartesApiException>({
        queryKey: RQKeys.community_list(params.page, params.limit),
        queryFn: ({ signal }) => api.community.get(params, signal),
        staleTime: 3600000,
        retry: false,
        enabled: filter === "public",
    });

    const communitiesAsMember = useQuery<GetResponse<CommunityResponseDTO>, CartesApiException>({
        queryKey: RQKeys.communities_as_member(communitiesAsMemberParams.pending, communitiesAsMemberParams.page, communitiesAsMemberParams.limit),
        queryFn: ({ signal }) => api.community.getAsMember(communitiesAsMemberParams, signal),
        staleTime: 3600000,
        retry: false,
        enabled: filter === "iam_member" || filter === "affiliation",
    });

    const handleFilterChange = (filter: CommunityListFilter) => {
        setFilter(filter);
        setCommunity(null);
        if (filter === "iam_member" || filter === "affiliation") {
            // TODO A VOIR SI 2 REQUETES DIFFERENTES
            setCommunitiesAsMemberParams({ pending: filter === "affiliation", page: 1, limit: defaultLimit });
        }
    };

    return (
        <div className={fr.cx("fr-container")}>
            <h1>{t("title")}</h1>
            <div className={fr.cx("fr-grid-row")}>
                <RadioButtons
                    legend={t("filters")}
                    options={[
                        {
                            label: t("all_public_communities"),
                            nativeInputProps: {
                                checked: filter === "public",
                                onChange: () => handleFilterChange("public"),
                            },
                        },
                        {
                            label: t("communities_as_member"),
                            nativeInputProps: {
                                checked: filter === "iam_member",
                                onChange: () => handleFilterChange("iam_member"),
                            },
                        },
                        {
                            label: t("pending_membership"),
                            nativeInputProps: {
                                checked: filter === "affiliation",
                                onChange: () => handleFilterChange("affiliation"),
                            },
                        },
                    ]}
                    orientation="horizontal"
                />
            </div>
            {communityQuery.isLoading || communitiesAsMember.isLoading ? (
                <MuiDsfrThemeProvider>
                    {[...Array(10).keys()].map((n) => (
                        <Skeleton className={fr.cx("fr-my-2v")} key={n} variant="rectangular" height={50} />
                    ))}
                </MuiDsfrThemeProvider>
            ) : communityQuery.isError ? (
                <Alert severity="error" closable={false} title={communityQuery.error?.message} />
            ) : communitiesAsMember.isError ? (
                <Alert severity="error" closable={false} title={communitiesAsMember.error?.message} />
            ) : (
                <div>
                    <SearchCommunity
                        filter={filter}
                        onChange={(community) => {
                            setCommunity(community);
                        }}
                    />
                    {community ? (
                        <CommunityList communities={[community]} filter={filter} />
                    ) : filter === "public" ? (
                        communityQuery.data && (
                            <div>
                                <CommunityList communities={communityQuery.data.content} filter={filter} />
                                <div className={fr.cx("fr-grid-row", "fr-grid-row--center")}>
                                    <Pagination
                                        size={"large"}
                                        count={communityQuery.data.totalPages}
                                        page={params.page}
                                        onChange={(_, page) => setParams({ ...params, page: page, limit: defaultLimit })}
                                    />
                                </div>
                            </div>
                        )
                    ) : (
                        communitiesAsMember.data && (
                            <div>
                                <CommunityList communities={communitiesAsMember.data.content} filter={filter} />
                                <div className={fr.cx("fr-grid-row", "fr-grid-row--center")}>
                                    <Pagination
                                        size={"large"}
                                        count={communitiesAsMember.data.totalPages}
                                        page={communitiesAsMemberParams.page}
                                        onChange={(_, page) => setCommunitiesAsMemberParams({ ...communitiesAsMemberParams, page: page, limit: defaultLimit })}
                                    />
                                </div>
                            </div>
                        )
                    )}
                </div>
            )}
        </div>
    );
};

export default Communities;

import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { useQuery } from "@tanstack/react-query";
import { FC, useState } from "react";
import { CommunityListFilter, GetResponse } from "../../../@types/app_espaceco";
import { CommunityResponseDTO } from "../../../@types/espaceco";
import Skeleton from "../../../components/Utils/Skeleton";
import { useTranslation } from "../../../i18n/i18n";
import RQKeys from "../../../modules/espaceco/RQKeys";
import { CartesApiException } from "../../../modules/jsonFetch";
import api from "../../api";
import CommunityList from "./CommunityList";
import SearchCommunity from "./SearchCommunity";
import Pagination from "../../../components/Utils/Pagination";

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
            setCommunitiesAsMemberParams({ ...communitiesAsMemberParams, page: 1, pending: filter === "affiliation" });
        }
    };

    return (
        <div className={fr.cx("fr-container")}>
            <h1>{t("title")}</h1>
            <div>
                {communityQuery.isError && <Alert severity="error" closable={false} title={communityQuery.error?.message} />}
                {communitiesAsMember.isError && <Alert severity="error" closable={false} title={communitiesAsMember.error?.message} />}
            </div>
            <div className={fr.cx("fr-grid-row")}>
                <div className={fr.cx("fr-col-4", "fr-px-2v")}>
                    <label className={fr.cx("fr-text--bold")}>{t("filters")}</label>
                    <div className={fr.cx("fr-mb-4v")}>
                        <SearchCommunity
                            filter={filter}
                            onChange={(community) => {
                                setCommunity(community);
                            }}
                        />
                    </div>
                    <RadioButtons
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
                    />
                </div>
                <div className={fr.cx("fr-col-8", "fr-px-2v")}>
                    {communityQuery.isLoading || communitiesAsMember.isLoading ? (
                        <Skeleton count={10} />
                    ) : community ? (
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
            </div>
        </div>
    );
};

export default Communities;

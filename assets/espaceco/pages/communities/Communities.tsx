import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { Pagination } from "@codegouvfr/react-dsfr/Pagination";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { useQuery } from "@tanstack/react-query";
import { FC, useMemo, useState } from "react";

import { CommunityListFilter, GetResponse, arrCommunityListFilters } from "../../../@types/app_espaceco";
import { CommunityResponseDTO } from "../../../@types/espaceco";
import AppLayout from "../../../components/Layout/AppLayout";
import Skeleton from "../../../components/Utils/Skeleton";
import { datastoreNavItems } from "../../../config/datastoreNavItems";
import { useTranslation } from "../../../i18n/i18n";
import RQKeys from "../../../modules/espaceco/RQKeys";
import { CartesApiException } from "../../../modules/jsonFetch";
import { routes, useRoute } from "../../../router/router";
import api from "../../api";
import CommunityList from "./CommunityList";
import SearchCommunity from "./SearchCommunity";

const defaultLimit = 10;

const navItems = datastoreNavItems();

type QueryParamsType = {
    page: number;
    limit: number;
    pending?: boolean;
};

const Communities: FC = () => {
    const route = useRoute();
    const { t } = useTranslation("CommunityList");

    const filter = useMemo<CommunityListFilter>(() => {
        const f = route.params["filter"];
        return arrCommunityListFilters.includes(f) ? f : "public";
    }, [route]);

    const queryParams = useMemo<QueryParamsType>(() => {
        const page = Number.isInteger(route.params["page"]) ? route.params["page"] : 1;

        const params: QueryParamsType = { page: page, limit: defaultLimit };
        if (["iam_member", "affiliation"].includes(filter)) {
            params["pending"] = filter === "iam_member" ? false : true;
        }
        return params;
    }, [route, filter]);

    const [community, setCommunity] = useState<CommunityResponseDTO | null>(null);

    const communityQuery = useQuery<GetResponse<CommunityResponseDTO>, CartesApiException>({
        queryKey: RQKeys.community_list(queryParams.page, queryParams.limit),
        queryFn: ({ signal }) => api.community.get(queryParams, signal),
        staleTime: 3600000,
        retry: false,
        enabled: filter === "public",
    });

    const communitiesAsMember = useQuery<GetResponse<CommunityResponseDTO>, CartesApiException>({
        queryKey: RQKeys.communities_as_member(queryParams.pending ?? false, queryParams.page, queryParams.limit),
        queryFn: ({ signal }) => api.community.getAsMember(queryParams, signal),
        staleTime: 3600000,
        retry: false,
        enabled: filter === "iam_member" || filter === "affiliation",
    });

    const handleFilterChange = (filter: CommunityListFilter) => {
        setCommunity(null);
        routes.espaceco_community_list({ filter: filter, page: 1 }).push();
    };

    return (
        <AppLayout navItems={navItems} documentTitle={t("title")}>
            <h1>{t("title")}</h1>
            <div>
                {communityQuery.isError && <Alert severity="error" closable={false} title={communityQuery.error?.message} />}
                {communitiesAsMember.isError && <Alert severity="error" closable={false} title={communitiesAsMember.error?.message} />}
            </div>
            <div className={fr.cx("fr-grid-row")}>
                <div className={fr.cx("fr-col-3", "fr-px-2v")}>
                    {/* <div className={fr.cx("fr-mb-2v")}>
                        <span className={fr.cx("fr-text--lg")}>{t("filters")}</span>
                    </div> */}
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
                <div className={fr.cx("fr-col-9", "fr-px-2v")}>
                    {communityQuery.isLoading || communitiesAsMember.isLoading ? (
                        <Skeleton count={10} />
                    ) : community ? (
                        <CommunityList communities={[community]} />
                    ) : filter === "public" ? (
                        communityQuery.data && communityQuery.data.content.length ? (
                            <div>
                                <CommunityList communities={communityQuery.data.content} />
                                <div className={fr.cx("fr-grid-row", "fr-grid-row--center")}>
                                    <Pagination
                                        count={communityQuery.data.totalPages}
                                        defaultPage={queryParams.page}
                                        getPageLinkProps={(pageNumber) => routes.espaceco_community_list({ filter: filter, page: pageNumber }).link}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className={fr.cx("fr-my-2v")}>
                                <Alert severity={"info"} title={t("no_result", { filter: filter })} closable />
                            </div>
                        )
                    ) : communitiesAsMember.data && communitiesAsMember.data.content.length ? (
                        <div>
                            <CommunityList communities={communitiesAsMember.data.content} />
                            <div className={fr.cx("fr-grid-row", "fr-grid-row--center")}>
                                <Pagination
                                    count={communitiesAsMember.data.totalPages}
                                    defaultPage={queryParams.page}
                                    getPageLinkProps={(pageNumber) => routes.espaceco_community_list({ filter: filter, page: pageNumber }).link}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className={fr.cx("fr-my-2v")}>
                            <Alert severity={"info"} title={t("no_result", { filter: filter })} closable />
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
};

export default Communities;

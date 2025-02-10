import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { Pagination } from "@codegouvfr/react-dsfr/Pagination";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, useMemo, useState } from "react";

import { CommunityListFilter, GetResponse, UserMe, arrCommunityListFilters } from "../../../@types/app_espaceco";
import { CommunityResponseDTO } from "../../../@types/espaceco";
import AppLayout from "../../../components/Layout/AppLayout";
import LoadingText from "../../../components/Utils/LoadingText";
import Skeleton from "../../../components/Utils/Skeleton";
import Wait from "../../../components/Utils/Wait";
import { datastoreNavItems } from "../../../config/navItems/datastoreNavItems";
import { useTranslation } from "../../../i18n/i18n";
import RQKeys from "../../../modules/espaceco/RQKeys";
import { CartesApiException } from "../../../modules/jsonFetch";
import { routes, useRoute } from "../../../router/router";
import api from "../../api";
import CommunityList from "./CommunityList";
import { CreateCommunityDialog, CreateCommunityDialogModal } from "./CreateCommunityDialog";
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

    const { t: tCommon } = useTranslation("Common");
    const { t: tBreadcrumb } = useTranslation("Breadcrumb");
    const { t } = useTranslation("CommunityList");

    const filter = useMemo<CommunityListFilter>(() => {
        const f = route.params["filter"];
        return arrCommunityListFilters.includes(f) ? f : "listed";
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

    const { data: me } = useQuery<UserMe, CartesApiException>({
        queryKey: RQKeys.getMe(),
        queryFn: ({ signal }) => api.user.getMe(signal),
        staleTime: 3600000,
    });

    const communityQuery = useQuery<GetResponse<CommunityResponseDTO>, CartesApiException>({
        queryKey: RQKeys.communityList(queryParams.page, queryParams.limit),
        queryFn: ({ signal }) => api.community.get(queryParams, signal),
        staleTime: 3600000,
        enabled: filter === "listed",
    });

    const communitiesAsMember = useQuery<GetResponse<CommunityResponseDTO>, CartesApiException>({
        queryKey: RQKeys.communitiesAsMember(queryParams.pending ?? false, queryParams.page, queryParams.limit),
        queryFn: ({ signal }) => api.community.getAsMember(queryParams, signal),
        staleTime: 3600000,
        enabled: filter === "iam_member" || filter === "affiliation",
    });

    const { data: communityNames } = useQuery<string[], CartesApiException>({
        queryKey: RQKeys.communitiesName(),
        queryFn: () => api.community.getCommunitiesName(),
        staleTime: 3600000,
    });

    const hasRights = useMemo(() => {
        if (!me) return false;
        if (me.administrator) return true;

        const communityMemberHasAdmin = me.communities_member.filter((m) => m.role === "admin");
        return communityMemberHasAdmin.length > 0;
    }, [me]);

    const handleFilterChange = (filter: CommunityListFilter) => {
        setCommunity(null);
        routes.espaceco_community_list({ filter: filter, page: 1 }).push();
    };

    const queryClient = useQueryClient();

    /* Creation du guichet */
    const { isPending, isError, error, mutate } = useMutation<CommunityResponseDTO, CartesApiException, FormData>({
        mutationFn: (data: FormData) => {
            return api.community.add(data);
        },
        onSuccess: (community) => {
            queryClient.setQueryData<string[]>(RQKeys.communitiesName(), (oldNames) => {
                const names = oldNames ? [...oldNames] : [];
                names.push(community.name);
                return names;
            });

            queryClient.setQueryData<CommunityResponseDTO>(RQKeys.community(community.id), () => {
                return community;
            });
            routes.espaceco_create_community({ communityId: community.id }).push();
        },
    });

    return (
        <AppLayout
            navItems={navItems}
            customBreadcrumbProps={{
                homeLinkProps: routes.home().link,
                segments: [{ label: tBreadcrumb("dashboard_pro"), linkProps: routes.dashboard_pro().link }],
                currentPageLabel: tBreadcrumb("espaceco_community_list"),
            }}
            documentTitle={t("title")}
        >
            <h1>{t("title")}</h1>
            <div>
                {communityQuery.isError && <Alert severity="error" closable={false} title={communityQuery.error?.message} />}
                {communitiesAsMember.isError && <Alert severity="error" closable={false} title={communitiesAsMember.error?.message} />}
                {isPending && (
                    <Wait>
                        <div className={fr.cx("fr-grid-row")}>
                            <LoadingText as="h6" message={t("community_creation")} withSpinnerIcon={true} />
                        </div>
                    </Wait>
                )}
                {isError && <Alert severity="error" closable title={tCommon("error")} description={error.message} className={fr.cx("fr-my-3w")} />}
            </div>
            {hasRights && (
                <div className={fr.cx("fr-grid-row", "fr-my-2v")}>
                    <Button onClick={() => CreateCommunityDialogModal.open()}>{t("create_community")}</Button>
                </div>
            )}
            <div className={fr.cx("fr-grid-row")}>
                <div className={fr.cx("fr-col-3", "fr-px-2v")}>
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
                                    checked: filter === "listed",
                                    onChange: () => handleFilterChange("listed"),
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
                    ) : filter === "listed" ? (
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
            <CreateCommunityDialog
                communityNames={communityNames ?? []}
                onAdd={(name) => {
                    const datas = new FormData();
                    datas.append("name", name);
                    mutate(datas);
                }}
            />
        </AppLayout>
    );
};

export default Communities;

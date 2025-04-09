import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { Pagination } from "@codegouvfr/react-dsfr/Pagination";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, useMemo, useState } from "react";

import Main from "@/components/Layout/Main";
import { CommunityListFilter, GetResponse, arrCommunityListFilters } from "../../../@types/app_espaceco";
import { CommunityResponseDTO } from "../../../@types/espaceco";
import LoadingText from "../../../components/Utils/LoadingText";
import Skeleton from "../../../components/Utils/Skeleton";
import Wait from "../../../components/Utils/Wait";
import { useTranslation } from "../../../i18n/i18n";
import RQKeys from "../../../modules/espaceco/RQKeys";
import { CartesApiException } from "../../../modules/jsonFetch";
import { routes, useRoute } from "../../../router/router";
import api from "../../api";
import CommunityList from "./CommunityList";
import { CreateCommunityDialog, CreateCommunityDialogModal } from "./CreateCommunityDialog";
import SearchCommunity from "./SearchCommunity";
import useUserMe from "@/espaceco/hooks/useUserMe";

const defaultLimit = 10;

type QueryParamsType = {
    page: number;
    limit: number;
    pending?: boolean;
};

const Communities: FC = () => {
    const route = useRoute();

    const meQuery = useUserMe();
    const { data: me } = meQuery;

    const { t: tCommon } = useTranslation("Common");
    const { t: tBreadcrumb } = useTranslation("Breadcrumb");
    const { t: tValid } = useTranslation("ManageCommunityValidations");
    const { t } = useTranslation("EspaceCoCommunityList");

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

    const communityQuery = useQuery<GetResponse<CommunityResponseDTO>, CartesApiException>({
        queryKey: RQKeys.communityList(queryParams.page, queryParams.limit),
        queryFn: ({ signal }) => api.community.get(queryParams, signal),
        staleTime: 3600000,
        enabled: filter === "listed",
    });

    const communitiesAsMemberQuery = useQuery<GetResponse<CommunityResponseDTO>, CartesApiException>({
        queryKey: RQKeys.communitiesAsMember(queryParams.pending ?? false, queryParams.page, queryParams.limit),
        queryFn: ({ signal }) => api.community.getAsMember(queryParams, signal),
        staleTime: 3600000,
        enabled: filter === "iam_member" || filter === "affiliation",
    });

    const hasRights = useMemo(() => {
        if (me?.administrator) return true;

        const communityMemberHasAdmin = me?.communities_member.filter((m) => m.role === "admin") || [];
        return communityMemberHasAdmin.length > 0;
    }, [me]);

    const handleFilterChange = (filter: CommunityListFilter) => {
        setCommunity(null);
        routes.espaceco_community_list({ filter: filter, page: 1 }).push();
    };

    const queryClient = useQueryClient();

    /* Creation du guichet */
    const { isPending, isError, error, mutate } = useMutation<CommunityResponseDTO, CartesApiException, string>({
        mutationFn: (name: string) => {
            return api.community.add({ name });
        },
        onSuccess: (community) => {
            // Mise a jour de users/me
            meQuery.refetch();

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
        <Main
            customBreadcrumbProps={{
                homeLinkProps: routes.home().link,
                segments: [{ label: tBreadcrumb("dashboard_pro"), linkProps: routes.dashboard_pro().link }],
                currentPageLabel: tBreadcrumb("espaceco_community_list"),
            }}
            title={t("title")}
        >
            <h1>{t("title")}</h1>
            <div>
                {isPending && (
                    <Wait>
                        <div className={fr.cx("fr-grid-row")}>
                            <LoadingText as="h6" message={t("community_creation")} withSpinnerIcon={true} />
                        </div>
                    </Wait>
                )}
                {isError && (
                    <Alert
                        severity="error"
                        closable
                        title={tCommon("error")}
                        description={error.code === 400 ? tValid("description.name.unique") : error.message}
                        className={fr.cx("fr-my-3w")}
                    />
                )}
                {communityQuery.isError && <Alert severity="error" closable={false} title={communityQuery.error?.message} />}
                {communitiesAsMemberQuery.isError && <Alert severity="error" closable={false} title={communitiesAsMemberQuery.error?.message} />}
            </div>
            {hasRights && (
                <div className={fr.cx("fr-grid-row", "fr-my-2w")}>
                    <Button onClick={() => CreateCommunityDialogModal.open()}>{t("create_community")}</Button>
                </div>
            )}
            <div className={fr.cx("fr-grid-row")}>
                <div className={fr.cx("fr-col-4", "fr-px-2v")}>
                    <div className={fr.cx("fr-my-4v")}>
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
                <div className={fr.cx("fr-col-8", "fr-px-2v")}>
                    {communityQuery.isLoading || communitiesAsMemberQuery.isLoading ? (
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
                    ) : communitiesAsMemberQuery.data && communitiesAsMemberQuery.data.content.length ? (
                        <div>
                            <CommunityList communities={communitiesAsMemberQuery.data.content} />
                            <div className={fr.cx("fr-grid-row", "fr-grid-row--center")}>
                                <Pagination
                                    count={communitiesAsMemberQuery.data.totalPages}
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
                onAdd={(name) => {
                    mutate(name);
                }}
            />
        </Main>
    );
};

export default Communities;

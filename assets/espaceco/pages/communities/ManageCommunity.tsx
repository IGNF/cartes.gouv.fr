import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import Tabs from "@codegouvfr/react-dsfr/Tabs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, useMemo, useState } from "react";

import Main from "@/components/Layout/Main";
import { UserMe } from "../../../@types/app_espaceco";
import { CommunityResponseDTO } from "../../../@types/espaceco";
import LoadingText from "../../../components/Utils/LoadingText";
import { useTranslation } from "../../../i18n/i18n";
import RQKeys from "../../../modules/espaceco/RQKeys";
import { CartesApiException } from "../../../modules/jsonFetch";
import { routes } from "../../../router/router";
import api from "../../api";
import Description from "./management/Description";
import Tools from "./management/Tools";
import Grid from "./management/Grid";
import Layer from "./management/Layer";
import Members from "./management/Members";
import Reports from "./management/Reports";
import ZoomAndCentering from "./management/ZoomAndCentering";
import Wait from "../../../components/Utils/Wait";
import Databases from "./management/Databases";

type ManageCommunityProps = {
    communityId: number;
};

const ManageCommunity: FC<ManageCommunityProps> = ({ communityId }) => {
    const { t } = useTranslation("ManageCommunity");
    const { t: tBreadcrumb } = useTranslation("Breadcrumb");

    const {
        data: me,
        isLoading,
        isError,
        error,
    } = useQuery<UserMe, CartesApiException>({
        queryKey: RQKeys.getMe(),
        queryFn: ({ signal }) => api.user.getMe(signal),
        staleTime: 3600000,
    });

    const queryClient = useQueryClient();

    const communityQuery = useQuery<CommunityResponseDTO, CartesApiException>({
        queryKey: RQKeys.community(communityId),
        queryFn: () => api.community.getCommunity(communityId),
        staleTime: 3600000,
    });

    const {
        isPending: isUpdatePending,
        isError: isUpdateError,
        mutate,
    } = useMutation<CommunityResponseDTO, CartesApiException, object>({
        mutationFn: (datas: object) => {
            return api.community.update(communityId, datas);
        },
        onSuccess(community) {
            queryClient.setQueryData<CommunityResponseDTO>(RQKeys.community(community.id), () => {
                return community;
            });
        },
    });

    // Les droits pour pouvoir modifier un guichet
    const hasRights = useMemo(() => {
        if (me && communityQuery.data) {
            if (me.administrator) {
                return true;
            }
            const f = me.communities_member.filter((cm) => cm.role === "admin" && cm.community_id === communityQuery.data.id);
            return f.length === 1;
        }
        return false;
    }, [me, communityQuery.data]);

    const [selectedTabId, setSelectedTabId] = useState("tab1");

    // S'il est active === false, il est toujours en cours de création
    const forbidden = useMemo(() => {
        if (communityQuery.data) {
            return communityQuery.data.active === false;
        }
        return false;
    }, [communityQuery.data]);

    return (
        <Main
            customBreadcrumbProps={{
                homeLinkProps: routes.home().link,
                segments: [
                    { label: tBreadcrumb("dashboard_pro"), linkProps: routes.dashboard_pro().link },
                    { label: tBreadcrumb("espaceco_community_list"), linkProps: routes.espaceco_community_list().link },
                ],
                currentPageLabel: tBreadcrumb("espaceco_manage_community", { communityName: communityQuery.data?.name }),
            }}
            title={t("title", { name: communityQuery.data?.name })}
        >
            <h1>{t("title", { name: communityQuery.data?.name })}</h1>
            {isUpdateError && <Alert severity="error" closable title={t("updating_failed")} />}
            {isUpdatePending && (
                <Wait>
                    <div className={fr.cx("fr-grid-row")}>
                        <LoadingText as="h6" message={t("updating")} withSpinnerIcon={true} />
                    </div>
                </Wait>
            )}
            {communityQuery.isError ? (
                <Alert
                    severity="error"
                    closable={false}
                    title={t("community_fetch_failed")}
                    description={
                        <>
                            <p>{communityQuery.error?.message}</p>
                            <Button linkProps={routes.espaceco_community_list().link}>{t("back_to_list")}</Button>
                        </>
                    }
                />
            ) : isError ? (
                <Alert
                    severity="error"
                    closable={false}
                    title={t("me_fetch_failed")}
                    description={
                        <>
                            <p>{error.message}</p>
                            <Button linkProps={routes.espaceco_community_list().link}>{t("back_to_list")}</Button>
                        </>
                    }
                />
            ) : communityQuery.isLoading || isLoading ? (
                <LoadingText message={t("loading")} />
            ) : hasRights === false ? (
                <Alert severity="error" closable={false} title={t("no_rights")} />
            ) : forbidden ? (
                <Alert severity="error" closable={false} title={t("forbidden_access")} />
            ) : (
                communityQuery.data && (
                    <div className={fr.cx("fr-container", "fr-py-2w")}>
                        <Tabs
                            selectedTabId={selectedTabId}
                            tabs={[
                                { tabId: "tab1", label: t("tab1") }, // Description
                                { tabId: "tab2", label: t("tab2") }, // Bases de données
                                { tabId: "tab3", label: t("tab3") }, // Zoom, centrage
                                { tabId: "tab4", label: t("tab4") }, // Couches de la carte
                                { tabId: "tab5", label: t("tab5") }, // Outils
                                { tabId: "tab6", label: t("tab6") }, // Signalements
                                { tabId: "tab7", label: t("tab7") }, // Emprises
                                { tabId: "tab8", label: t("tab8") }, // Membres
                            ]}
                            onTabChange={setSelectedTabId}
                        >
                            <>
                                {(() => {
                                    switch (selectedTabId) {
                                        case "tab1":
                                            return (
                                                <Description
                                                    mode={"edition"}
                                                    community={communityQuery.data}
                                                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                                    onSubmit={(datas, _) => {
                                                        mutate(datas);
                                                    }}
                                                />
                                            );
                                        case "tab2":
                                            return <Databases mode={"edition"} community={communityQuery.data} />;
                                        case "tab3":
                                            return (
                                                <ZoomAndCentering
                                                    mode={"edition"}
                                                    community={communityQuery.data}
                                                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                                    onSubmit={(datas, _) => {
                                                        mutate(datas);
                                                    }}
                                                />
                                            );
                                        case "tab4":
                                            return <Layer />;
                                        case "tab5":
                                            return (
                                                <Tools
                                                    mode={"edition"}
                                                    community={communityQuery.data}
                                                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                                    onSubmit={(datas, _) => {
                                                        mutate(datas);
                                                    }}
                                                />
                                            );
                                        case "tab6":
                                            return (
                                                <Reports
                                                    mode={"edition"}
                                                    community={communityQuery.data}
                                                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                                    onSubmit={(datas, _) => {
                                                        mutate(datas);
                                                    }}
                                                />
                                            );
                                        case "tab7":
                                            return (
                                                <Grid
                                                    grids={communityQuery.data.grids}
                                                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                                    onSubmit={(datas, _) => {
                                                        mutate(datas);
                                                    }}
                                                />
                                            ); // TODO
                                        case "tab8":
                                            return <Members community={communityQuery.data} />;
                                        default:
                                            return <p>`Content of ${selectedTabId}`</p>;
                                    }
                                })()}
                            </>
                        </Tabs>
                    </div>
                )
            )}
        </Main>
    );
};

export default ManageCommunity;

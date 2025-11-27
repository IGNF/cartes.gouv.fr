import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import Tabs from "@codegouvfr/react-dsfr/Tabs";
import { FC, useMemo } from "react";

import { ManageCommunityActiveTabEnum } from "@/@types/app_espaceco";
import Main from "@/components/Layout/Main";
import { useCommunityContext } from "@/espaceco/contexts/CommunityContext";
import useUserMe from "@/espaceco/hooks/useUserMe";
import LoadingText from "../../../components/Utils/LoadingText";
import { useTranslation } from "../../../i18n/i18n";
import { routes, useRoute } from "../../../router/router";
import Databases from "./management/Databases";
import Description from "./management/Description";
import Grids from "./management/Grids";
import Layers from "./management/Layers";
import Members from "./management/Members";
import Reports from "./management/Reports";
import Tools from "./management/Tools";
import ZoomAndCentering from "./management/ZoomAndCentering";

const ManageCommunity: FC = () => {
    const { data: me, isLoading: isMeLoading, isError: isMeError, error: meError } = useUserMe();

    const { t } = useTranslation("ManageCommunity");
    const { t: tBreadcrumb } = useTranslation("Breadcrumb");

    const { community, isCommunityLoading, isCommunityError, communityError } = useCommunityContext();

    const route = useRoute();
    const activeTab: ManageCommunityActiveTabEnum = Object.values(ManageCommunityActiveTabEnum).includes(route.params?.["activeTab"])
        ? route.params?.["activeTab"]
        : ManageCommunityActiveTabEnum.Description;

    const isAdmin = useMemo(() => {
        return me?.administrator === true;
    }, [me]);

    // Les droits pour pouvoir créer un guichet
    const hasRights = useMemo(() => {
        if (me?.administrator) {
            return true;
        }
        const f = me?.communities_member.filter((cm) => cm.role === "admin") || [];
        return f.length > 0;
    }, [me]);

    // S'il est active === false, il est toujours en cours de création
    const forbidden = useMemo(() => {
        if (community) {
            return community.active === false;
        }
        return false;
    }, [community]);

    return (
        <Main
            customBreadcrumbProps={{
                homeLinkProps: routes.discover().link,
                segments: [
                    { label: tBreadcrumb("dashboard"), linkProps: routes.dashboard().link },
                    { label: tBreadcrumb("espaceco_community_list"), linkProps: routes.espaceco_community_list().link },
                ],
                currentPageLabel: tBreadcrumb("espaceco_manage_community", { communityName: community?.name }),
            }}
            title={t("title", { name: community?.name })}
        >
            <h1>{t("title", { name: community?.name })}</h1>
            {isMeLoading ? (
                <LoadingText as={"h6"} message={t("loading_me")} />
            ) : isMeError ? (
                <Alert
                    severity="error"
                    closable={false}
                    title={t("me_fetch_failed")}
                    description={
                        <>
                            <p>{meError.message}</p>
                            <Button linkProps={routes.espaceco_community_list().link}>{t("back_to_list")}</Button>
                        </>
                    }
                />
            ) : isCommunityError ? (
                <Alert
                    severity="error"
                    closable={false}
                    title={t("community_fetch_failed")}
                    description={
                        <>
                            <p>{communityError?.message}</p>
                            <Button linkProps={routes.espaceco_community_list().link}>{t("back_to_list")}</Button>
                        </>
                    }
                />
            ) : isCommunityLoading ? (
                <LoadingText as={"h2"} message={t("loading")} />
            ) : hasRights === false ? (
                <Alert severity="error" closable={false} title={t("no_rights")} />
            ) : forbidden ? (
                <Alert severity="error" closable={false} title={t("forbidden_access")} />
            ) : (
                community && (
                    <div className={fr.cx("fr-container", "fr-py-2w")}>
                        <Tabs
                            tabs={Object.values(ManageCommunityActiveTabEnum).map((v) => ({
                                tabId: v,
                                label: t("tab", { tab: v }),
                            }))}
                            selectedTabId={activeTab}
                            onTabChange={(activeTab) => {
                                routes.espaceco_manage_community({ communityId: community.id, activeTab }).replace();
                            }}
                        >
                            <>
                                {(() => {
                                    switch (activeTab) {
                                        case ManageCommunityActiveTabEnum.Description:
                                            return <Description isAdmin={isAdmin} />;
                                        case ManageCommunityActiveTabEnum.Databases:
                                            return <Databases />;
                                        case ManageCommunityActiveTabEnum.Layers:
                                            return <Layers />;
                                        case ManageCommunityActiveTabEnum.Zoom:
                                            return <ZoomAndCentering />;
                                        case ManageCommunityActiveTabEnum.Tools:
                                            return <Tools />;
                                        case ManageCommunityActiveTabEnum.Reports:
                                            return <Reports />;
                                        case ManageCommunityActiveTabEnum.Grids:
                                            return <Grids />;
                                        case ManageCommunityActiveTabEnum.Members:
                                            return <Members />;
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

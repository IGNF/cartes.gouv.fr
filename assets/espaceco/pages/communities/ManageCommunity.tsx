import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import Tabs from "@codegouvfr/react-dsfr/Tabs";
import { useQuery } from "@tanstack/react-query";
import { FC, useMemo, useState } from "react";

import Main from "@/components/Layout/Main";
import { useCommunityContext } from "@/espaceco/contexts/CommunityContext";
import { UserMe } from "../../../@types/app_espaceco";
import LoadingText from "../../../components/Utils/LoadingText";
import { useTranslation } from "../../../i18n/i18n";
import RQKeys from "../../../modules/espaceco/RQKeys";
import { CartesApiException } from "../../../modules/jsonFetch";
import { routes } from "../../../router/router";
import api from "../../api";
import Description from "./management/Description";
import Grid from "./management/Grid";
import Layer from "./management/Layer";
import Members from "./management/Members";
import Reports from "./management/Reports";
import Tools from "./management/Tools";
import ZoomAndCentering from "./management/ZoomAndCentering";

const ManageCommunity: FC = () => {
    const { t } = useTranslation("ManageCommunity");
    const { t: tBreadcrumb } = useTranslation("Breadcrumb");

    const { community, isCommunityLoading, isCommunityError, communityError } = useCommunityContext();

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

    const isAdmin = useMemo(() => {
        return me?.administrator === true;
    }, [me]);

    // Les droits pour pouvoir modifier un guichet
    const hasRights = useMemo(() => {
        if (me?.administrator) {
            return true;
        }
        const f = me?.communities_member.filter((cm) => cm.role === "admin");
        return f ? f.length > 0 : false;
    }, [me]);

    const [selectedTabId, setSelectedTabId] = useState("tab1");

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
                homeLinkProps: routes.home().link,
                segments: [
                    { label: tBreadcrumb("dashboard_pro"), linkProps: routes.dashboard_pro().link },
                    { label: tBreadcrumb("espaceco_community_list"), linkProps: routes.espaceco_community_list().link },
                ],
                currentPageLabel: tBreadcrumb("espaceco_manage_community", { communityName: community?.name }),
            }}
            title={t("title", { name: community?.name })}
        >
            <h1>{t("title", { name: community?.name })}</h1>
            {isCommunityError ? (
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
            ) : isCommunityLoading || isLoading ? (
                <LoadingText message={t("loading")} />
            ) : hasRights === false ? (
                <Alert severity="error" closable={false} title={t("no_rights")} />
            ) : forbidden ? (
                <Alert severity="error" closable={false} title={t("forbidden_access")} />
            ) : (
                community && (
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
                                            return <Description isAdmin={isAdmin} />;
                                        // TODO
                                        /* case "tab2":
                                            return <Databases mode={"edition"} community={communityQuery.data} />; */
                                        case "tab3":
                                            return <ZoomAndCentering />;
                                        case "tab4":
                                            return <Layer />;
                                        case "tab5":
                                            return <Tools />;
                                        case "tab6":
                                            return <Reports />;
                                        case "tab7":
                                            return <Grid />;
                                        case "tab8":
                                            return <Members />;
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

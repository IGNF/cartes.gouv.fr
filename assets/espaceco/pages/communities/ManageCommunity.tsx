import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import Tabs from "@codegouvfr/react-dsfr/Tabs";
import { useQuery } from "@tanstack/react-query";
import { FC, useState } from "react";
import { CommunityResponseDTO } from "../../../@types/espaceco";
import AppLayout from "../../../components/Layout/AppLayout";
import LoadingText from "../../../components/Utils/LoadingText";
import { datastoreNavItems } from "../../../config/datastoreNavItems";
import { useTranslation } from "../../../i18n/i18n";
import RQKeys from "../../../modules/espaceco/RQKeys";
import { CartesApiException } from "../../../modules/jsonFetch";
import { routes } from "../../../router/router";
import api from "../../api";
import Description from "./management/Description";
import Grid from "./management/Grid";
import Layer from "./management/Layer";
import Reports from "./management/Reports";
import ZoomAndCentering from "./management/ZoomAndCentering";
import Members from "./management/Members";

type ManageCommunityProps = {
    communityId: number;
};

const navItems = datastoreNavItems();

const ManageCommunity: FC<ManageCommunityProps> = ({ communityId }) => {
    const { t } = useTranslation("ManageCommunity");
    const { t: tBreadcrumb } = useTranslation("Breadcrumb");

    const communityQuery = useQuery<CommunityResponseDTO, CartesApiException>({
        queryKey: RQKeys.community(communityId),
        queryFn: () => api.community.getCommunity(communityId),
        staleTime: 3600000,
    });

    const [selectedTabId, setSelectedTabId] = useState("tab1");

    return (
        <AppLayout
            navItems={navItems}
            customBreadcrumbProps={{
                homeLinkProps: routes.home().link,
                segments: [
                    { label: tBreadcrumb("dashboard_pro"), linkProps: routes.dashboard_pro().link },
                    { label: tBreadcrumb("espaceco_community_list"), linkProps: routes.espaceco_community_list().link },
                ],
                currentPageLabel: tBreadcrumb("espaceco_manage_community", { communityName: communityQuery.data?.name }),
            }}
            documentTitle={t("title", { name: communityQuery.data?.name })}
        >
            <h1>{t("title", { name: communityQuery.data?.name })}</h1>
            {communityQuery.isError ? (
                <Alert
                    severity="error"
                    closable={false}
                    title={t("fetch_failed")}
                    description={
                        <>
                            <p>{communityQuery.error?.message}</p>
                            <Button linkProps={routes.espaceco_community_list().link}>{t("back_to_list")}</Button>
                        </>
                    }
                />
            ) : communityQuery.isLoading ? (
                <LoadingText message={t("loading")} />
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
                                            return <Description mode={"edition"} community={communityQuery.data} onSubmit={(datas) => console.log(datas)} />;
                                        case "tab3":
                                            return <ZoomAndCentering community={communityQuery.data} />;
                                        case "tab4":
                                            return <Layer />;
                                        case "tab6":
                                            return <Reports community={communityQuery.data} />;
                                        case "tab7":
                                            return <Grid grids={communityQuery.data.grids ?? []} />; // TODO
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
        </AppLayout>
    );
};

export default ManageCommunity;

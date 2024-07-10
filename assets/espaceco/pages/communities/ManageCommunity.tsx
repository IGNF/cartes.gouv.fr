import { useQuery } from "@tanstack/react-query";
import { FC, useState } from "react";
import RQKeys from "../../../modules/espaceco/RQKeys";
import api from "../../api";
import { datastoreNavItems } from "../../../config/datastoreNavItems";
import AppLayout from "../../../components/Layout/AppLayout";
import { useTranslation } from "../../../i18n/i18n";
import LoadingText from "../../../components/Utils/LoadingText";
import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { routes } from "../../../router/router";
import Tabs from "@codegouvfr/react-dsfr/Tabs";
import Description from "./management/Description";
import { CommunityResponseDTO } from "../../../@types/espaceco";
import { CartesApiException } from "../../../modules/jsonFetch";

type ManageCommunityProps = {
    communityId: number;
};

const navItems = datastoreNavItems();

const ManageCommunity: FC<ManageCommunityProps> = ({ communityId }) => {
    const { t } = useTranslation("ManageCommunity");

    const communityQuery = useQuery<CommunityResponseDTO, CartesApiException>({
        queryKey: RQKeys.community(communityId),
        queryFn: () => api.community.getCommunity(communityId),
        staleTime: 3600000,
    });

    const [selectedTabId, setSelectedTabId] = useState("tab1");

    return (
        <AppLayout navItems={navItems} documentTitle={t("title", { name: communityQuery.data?.name })}>
            <h1>{t("title", { name: communityQuery.data?.name })}</h1>
            {communityQuery.isLoading ? (
                <LoadingText message={t("loading")} />
            ) : communityQuery.isError ? (
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
            ) : (
                communityQuery.data !== undefined && (
                    <div className={fr.cx("fr-container", "fr-py-2w")}>
                        <Tabs
                            selectedTabId={selectedTabId}
                            tabs={[
                                { tabId: "tab1", label: t("tab1") },
                                { tabId: "tab2", label: t("tab2") },
                                { tabId: "tab3", label: t("tab3") },
                                { tabId: "tab4", label: t("tab4") },
                                { tabId: "tab5", label: t("tab5") },
                                { tabId: "tab6", label: t("tab6") },
                            ]}
                            onTabChange={setSelectedTabId}
                        >
                            <>
                                {(() => {
                                    switch (selectedTabId) {
                                        case "tab1":
                                            return <Description community={communityQuery.data} />;
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

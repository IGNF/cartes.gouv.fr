import Alert from "@codegouvfr/react-dsfr/Alert";
import { useQuery } from "@tanstack/react-query";
import { FC, useState } from "react";

import { CommunityFormMode } from "../../../@types/app_espaceco";
import { CommunityResponseDTO } from "../../../@types/espaceco";
import AppLayout from "../../../components/Layout/AppLayout";
import LoadingText from "../../../components/Utils/LoadingText";
import { datastoreNavItems } from "../../../config/navItems/datastoreNavItems";
import { useTranslation } from "../../../i18n/i18n";
import RQKeys from "../../../modules/espaceco/RQKeys";
import { routes } from "../../../router/router";
import api from "../../api";
import { COMMUNITY_FORM_STEPS, CommunityStepper } from "./FormSteps";
import Description from "./management/Description";

const navItems = datastoreNavItems();

type CreateCommunityProps = {
    communityId: number;
};

const CreateCommunity: FC<CreateCommunityProps> = ({ communityId }) => {
    // const route = useRoute();

    const { t: tBreadcrumb } = useTranslation("Breadcrumb");
    const { t } = useTranslation("CreateCommunity");

    const mode: CommunityFormMode = "creation";

    const [currentStep, setCurrentStep] = useState<COMMUNITY_FORM_STEPS>(COMMUNITY_FORM_STEPS.DESCRIPTION);

    const communityQuery = useQuery<CommunityResponseDTO>({
        queryKey: RQKeys.community(communityId),
        queryFn: () => api.community.getCommunity(communityId),
        staleTime: 3600000,
    });

    return (
        <AppLayout
            navItems={navItems}
            customBreadcrumbProps={{
                homeLinkProps: routes.home().link,
                segments: [
                    { label: tBreadcrumb("dashboard_pro"), linkProps: routes.dashboard_pro().link },
                    { label: tBreadcrumb("espaceco_community_list"), linkProps: routes.espaceco_community_list().link },
                ],
                currentPageLabel: tBreadcrumb("espaceco_create_community"),
            }}
            documentTitle={t("title")}
        >
            {communityQuery.data?.active ? (
                <Alert severity="error" closable={false} title={t("forbidden_access")} />
            ) : (
                <div>
                    <h1>{t("title")}</h1>
                    <CommunityStepper mode={mode} currentStep={currentStep} />
                    {communityQuery.isError ? (
                        <Alert severity="error" closable={false} title={t("fetch_failed")} />
                    ) : communityQuery.isLoading ? (
                        <LoadingText as={"h2"} message={t("loading")} />
                    ) : (
                        communityQuery.data && (
                            <div>
                                {currentStep === COMMUNITY_FORM_STEPS.DESCRIPTION && (
                                    <Description mode={mode} community={communityQuery.data} onSubmit={(datas) => console.log(datas)} />
                                )}
                            </div>
                        )
                    )}
                </div>
            )}
        </AppLayout>
    );
};

export default CreateCommunity;

import Alert from "@codegouvfr/react-dsfr/Alert";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, useState } from "react";

import { fr } from "@codegouvfr/react-dsfr";
import Stepper from "@codegouvfr/react-dsfr/Stepper";
import { CommunityFormMode } from "../../../@types/app_espaceco";
import { CommunityResponseDTO } from "../../../@types/espaceco";
import AppLayout from "../../../components/Layout/AppLayout";
import LoadingText from "../../../components/Utils/LoadingText";
import Wait from "../../../components/Utils/Wait";
import { datastoreNavItems } from "../../../config/navItems/datastoreNavItems";
import { useTranslation } from "../../../i18n/i18n";
import RQKeys from "../../../modules/espaceco/RQKeys";
import { CartesApiException } from "../../../modules/jsonFetch";
import { routes } from "../../../router/router";
import api from "../../api";
import { COMMUNITY_FORM_STEPS, getMaxSteps } from "./FormSteps";
import Description from "./management/Description";

const navItems = datastoreNavItems();

type CreateCommunityProps = {
    communityId: number;
};

const CreateCommunity: FC<CreateCommunityProps> = ({ communityId }) => {
    const { t: tBreadcrumb } = useTranslation("Breadcrumb");
    const { t } = useTranslation("CreateCommunity");

    const mode: CommunityFormMode = "creation";
    const maxSteps = getMaxSteps(mode);

    const [currentStep, setCurrentStep] = useState<COMMUNITY_FORM_STEPS>(COMMUNITY_FORM_STEPS.DESCRIPTION);

    /*----------------------------------------------------- */

    const queryClient = useQueryClient();

    const communityQuery = useQuery<CommunityResponseDTO>({
        queryKey: RQKeys.community(communityId),
        queryFn: () => api.community.getCommunity(communityId),
        staleTime: 3600000,
    });

    const { isPending, isError, mutate } = useMutation<CommunityResponseDTO, CartesApiException, FormData>({
        mutationFn: (formData: FormData) => {
            return api.community.update(communityId, formData);
        },
        onSuccess(community) {
            queryClient.setQueryData<CommunityResponseDTO>(RQKeys.community(community.id), () => {
                return community;
            });
            if (currentStep < maxSteps) {
                setCurrentStep(currentStep + 1);
            } else {
                // TODO on est à la dernière étape du formulaire
            }
        },
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
                    <Stepper
                        currentStep={currentStep}
                        stepCount={maxSteps}
                        title={t("step_title", { stepNumber: currentStep })}
                        nextTitle={currentStep < maxSteps ? t("step_title", { stepNumber: currentStep + 1 }) : ""}
                    />
                    {isError && <Alert severity="error" closable title={t("updating_failed")} />}
                    {isPending && (
                        <Wait>
                            <div className={fr.cx("fr-grid-row")}>
                                <LoadingText as="h6" message={t("updating")} withSpinnerIcon={true} />
                            </div>
                        </Wait>
                    )}
                    {communityQuery.isError ? (
                        <Alert severity="error" closable={false} title={t("fetch_failed")} />
                    ) : communityQuery.isLoading ? (
                        <LoadingText as={"h2"} message={t("loading")} />
                    ) : (
                        communityQuery.data && (
                            <div>
                                {currentStep === COMMUNITY_FORM_STEPS.DESCRIPTION && (
                                    <Description mode={mode} community={communityQuery.data} onSubmit={(datas) => mutate(datas)} />
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

import Alert from "@codegouvfr/react-dsfr/Alert";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, useMemo, useState } from "react";

import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import Stepper from "@codegouvfr/react-dsfr/Stepper";
import Main from "@/components/Layout/Main";
import { CommunityFormMode, UserMe } from "../../../@types/app_espaceco";
import { CommunityResponseDTO } from "../../../@types/espaceco";
import LoadingText from "../../../components/Utils/LoadingText";
import Wait from "../../../components/Utils/Wait";
import { useTranslation } from "../../../i18n/i18n";
import RQKeys from "../../../modules/espaceco/RQKeys";
import { CartesApiException } from "../../../modules/jsonFetch";
import { routes } from "../../../router/router";
import api from "../../api";
import { COMMUNITY_FORM_STEPS, getMaxSteps } from "./FormSteps";
import Description from "./management/Description";
import ZoomAndCentering from "./management/ZoomAndCentering";
import Reports from "./management/Reports";
import EditTools from "./management/EditTools";

type CreateCommunityProps = {
    communityId: number;
};

const CreateCommunity: FC<CreateCommunityProps> = ({ communityId }) => {
    const { t: tBreadcrumb } = useTranslation("Breadcrumb");
    const { t } = useTranslation("CreateCommunity");

    const mode: CommunityFormMode = "creation";
    const maxSteps = getMaxSteps(mode);

    const [currentStep, setCurrentStep] = useState<COMMUNITY_FORM_STEPS>(COMMUNITY_FORM_STEPS.DESCRIPTION);
    const [saveOnly, setSaveOnly] = useState<boolean>(true);

    /*----------------------------------------------------- */

    const queryClient = useQueryClient();

    const meQuery = useQuery<UserMe, CartesApiException>({
        queryKey: RQKeys.getMe(),
        queryFn: ({ signal }) => api.user.getMe(signal),
        staleTime: 3600000,
    });

    const communityQuery = useQuery<CommunityResponseDTO>({
        queryKey: RQKeys.community(communityId),
        queryFn: () => api.community.getCommunity(communityId),
        staleTime: 3600000,
    });

    const { isPending, isError, mutate } = useMutation<CommunityResponseDTO, CartesApiException, object>({
        mutationFn: (datas: object) => {
            return api.community.update(communityId, datas);
        },
        onSuccess(community) {
            queryClient.setQueryData<CommunityResponseDTO>(RQKeys.community(community.id), () => {
                return community;
            });
            if (saveOnly) {
                return;
            }

            if (currentStep < maxSteps) {
                setCurrentStep(currentStep + 1);
            } else {
                // TODO on est à la dernière étape du formulaire
            }
        },
    });

    // Les droits pour pouvoir modifier un guichet
    const hasRights = useMemo(() => {
        if (meQuery.data && communityQuery.data) {
            const me = meQuery.data;
            if (me.administrator) {
                return true;
            }
            const f = me.communities_member.filter((cm) => cm.role === "admin");
            return f.length > 1;
        }
        return false;
    }, [meQuery.data, communityQuery.data]);

    // S'il est active === true, il peut être modifier mais ne peut pas être en cours de creation
    const forbidden = useMemo(() => {
        if (communityQuery.data) {
            return communityQuery.data.active === true;
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
                currentPageLabel: tBreadcrumb("espaceco_create_community"),
            }}
            title={t("title")}
        >
            {communityQuery.data?.active ? (
                <Alert severity="error" closable={false} title={t("forbidden_access")} />
            ) : (
                <div>
                    <h1>{t("title")}</h1>
                    <Stepper
                        currentStep={currentStep}
                        stepCount={maxSteps}
                        title={t("step_title", { step: currentStep })}
                        nextTitle={currentStep < maxSteps ? t("step_title", { step: currentStep + 1 }) : ""}
                    />
                    {isError && <Alert severity="error" closable title={t("updating_failed")} />}
                    {isPending && (
                        <Wait>
                            <div className={fr.cx("fr-grid-row")}>
                                <LoadingText as="h6" message={t("updating")} withSpinnerIcon={true} />
                            </div>
                        </Wait>
                    )}
                    {meQuery.isError ? (
                        <Alert
                            severity="error"
                            closable={false}
                            title={t("me_fetch_failed")}
                            description={
                                <>
                                    <p>{meQuery.error.message}</p>
                                    <Button linkProps={routes.espaceco_community_list().link}>{t("back_to_list")}</Button>
                                </>
                            }
                        />
                    ) : communityQuery.isError ? (
                        <Alert
                            severity="error"
                            closable={false}
                            title={t("community_fetch_failed")}
                            description={
                                <>
                                    <p>{communityQuery.error.message}</p>
                                    <Button linkProps={routes.espaceco_community_list().link}>{t("back_to_list")}</Button>
                                </>
                            }
                        />
                    ) : meQuery.isLoading || communityQuery.isLoading ? (
                        <LoadingText as={"h2"} message={t("loading")} />
                    ) : hasRights === false ? (
                        <Alert severity="error" closable={false} title={t("no_rights")} />
                    ) : forbidden ? (
                        <Alert severity="error" closable={false} title={t("forbidden_access")} />
                    ) : (
                        communityQuery.data && (
                            <div>
                                {currentStep === COMMUNITY_FORM_STEPS.DESCRIPTION ? (
                                    <Description
                                        mode={mode}
                                        community={communityQuery.data}
                                        onSubmit={(datas, saveOnly) => {
                                            setSaveOnly(saveOnly);
                                            mutate(datas);
                                        }}
                                    />
                                ) : currentStep === COMMUNITY_FORM_STEPS.ZOOM_AND_CENTERING ? (
                                    <ZoomAndCentering
                                        mode={mode}
                                        community={communityQuery.data}
                                        onPrevious={() => setCurrentStep(currentStep - 1)}
                                        onSubmit={(datas, saveOnly) => {
                                            setSaveOnly(saveOnly);
                                            mutate(datas);
                                        }}
                                    />
                                ) : currentStep === COMMUNITY_FORM_STEPS.TOOLS ? (
                                    <EditTools
                                        mode={mode}
                                        community={communityQuery.data}
                                        onPrevious={() => setCurrentStep(currentStep - 1)}
                                        // TODO REMETTRE
                                        /* onSubmit={(datas, saveOnly) => {
                                            setSaveOnly(saveOnly);
                                            mutate(datas);
                                        }} */
                                        onSubmit={(datas, saveOnly) => {
                                            setCurrentStep(currentStep + 1);
                                        }}
                                    />
                                ) : currentStep === COMMUNITY_FORM_STEPS.REPORTS ? (
                                    <Reports
                                        mode={mode}
                                        community={communityQuery.data}
                                        onPrevious={() => setCurrentStep(currentStep - 1)}
                                        onSubmit={(datas, saveOnly) => {
                                            setSaveOnly(saveOnly);
                                            mutate(datas);
                                        }}
                                    />
                                ) : (
                                    <div>TODO ...</div>
                                )}
                            </div>
                        )
                    )}
                </div>
            )}
        </Main>
    );
};

export default CreateCommunity;

import Alert from "@codegouvfr/react-dsfr/Alert";
import { useQuery } from "@tanstack/react-query";
import { FC, useMemo } from "react";

import Main from "@/components/Layout/Main";
import { useCommunityContext } from "@/espaceco/contexts/CommunityContext";
import Button from "@codegouvfr/react-dsfr/Button";
import Stepper from "@codegouvfr/react-dsfr/Stepper";
import { UserMe } from "../../../@types/app_espaceco";
import LoadingText from "../../../components/Utils/LoadingText";
import { useTranslation } from "../../../i18n/i18n";
import RQKeys from "../../../modules/espaceco/RQKeys";
import { CartesApiException } from "../../../modules/jsonFetch";
import { routes } from "../../../router/router";
import api from "../../api";
import { COMMUNITY_FORM_STEPS } from "./FormSteps";
import Description from "./management/Description";
import Reports from "./management/Reports";
import Tools from "./management/Tools";
import ZoomAndCentering from "./management/ZoomAndCentering";
import Wait from "@/components/Utils/Wait";
import { fr } from "@codegouvfr/react-dsfr";

const CreateCommunity: FC = () => {
    const { t: tCommon } = useTranslation("Common");
    const { t: tBreadcrumb } = useTranslation("Breadcrumb");
    const { t: tmc } = useTranslation("ManageCommunity");
    const { t } = useTranslation("CreateCommunity");

    const { currentStep, maxSteps, isLastStep, community, isCommunityLoading, isCommunityUpdating, isCommunityUpdatingError, updatingCommunityError } =
        useCommunityContext();

    const meQuery = useQuery<UserMe, CartesApiException>({
        queryKey: RQKeys.getMe(),
        queryFn: ({ signal }) => api.user.getMe(signal),
        staleTime: 3600000,
    });

    const isAdmin = useMemo(() => {
        return meQuery.data?.administrator === true;
    }, [meQuery.data]);

    // Les droits pour pouvoir modifier un guichet
    const hasRights = useMemo(() => {
        if (meQuery.data) {
            if (meQuery.data.administrator) {
                return true;
            }
            const f = meQuery.data.communities_member.filter((cm) => cm.role === "admin");
            return f.length > 0;
        }
        return false;
    }, [meQuery.data]);

    // S'il est active === true, il peut être modifier mais ne peut pas être en cours de creation
    const forbidden = useMemo(() => {
        if (community) {
            return community.active === true;
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
                currentPageLabel: tBreadcrumb("espaceco_create_community"),
            }}
            title={t("title")}
        >
            {community?.active ? (
                <Alert severity="error" closable={false} title={t("forbidden_access")} />
            ) : (
                <div>
                    <h1>{t("title")}</h1>
                    <Stepper
                        currentStep={currentStep}
                        stepCount={maxSteps}
                        title={t("step_title", { step: currentStep })}
                        nextTitle={!isLastStep() ? t("step_title", { step: currentStep + 1 }) : ""}
                    />
                    {isCommunityUpdating && (
                        <Wait>
                            <div className={fr.cx("fr-grid-row")}>
                                <LoadingText as="h6" message={tmc("updating")} withSpinnerIcon={true} />
                            </div>
                        </Wait>
                    )}
                    {isCommunityUpdatingError && (
                        <Alert className={fr.cx("fr-my-2v")} severity="error" closable title={tCommon("error")} description={updatingCommunityError?.message} />
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
                    ) : meQuery.isLoading || isCommunityLoading ? (
                        <LoadingText as={"h2"} message={t("loading_me")} />
                    ) : hasRights === false ? (
                        <Alert severity="error" closable={false} title={t("no_rights")} />
                    ) : forbidden ? (
                        <Alert severity="error" closable={false} title={t("forbidden_access")} />
                    ) : (
                        community && (
                            <div>
                                {currentStep === COMMUNITY_FORM_STEPS.DESCRIPTION ? (
                                    <Description isAdmin={isAdmin} />
                                ) : /* currentStep === COMMUNITY_FORM_STEPS.DATABASE ? (
                                    <Databases mode={mode} community={community} />
                                ) :*/ currentStep === COMMUNITY_FORM_STEPS.ZOOM_AND_CENTERING ? (
                                    <ZoomAndCentering />
                                ) : currentStep === COMMUNITY_FORM_STEPS.TOOLS ? (
                                    <Tools />
                                ) : currentStep === COMMUNITY_FORM_STEPS.REPORTS ? (
                                    <Reports />
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

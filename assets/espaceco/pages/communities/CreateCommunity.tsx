import Alert from "@codegouvfr/react-dsfr/Alert";
import { FC, useMemo } from "react";

import Main from "@/components/Layout/Main";
import Wait from "@/components/Utils/Wait";
import { useCommunityContext } from "@/espaceco/contexts/CommunityContext";
import useUserMe from "@/espaceco/hooks/useUserMe";
import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import Stepper from "@codegouvfr/react-dsfr/Stepper";
import LoadingText from "../../../components/Utils/LoadingText";
import { useTranslation } from "../../../i18n/i18n";
import { routes } from "../../../router/router";
import { COMMUNITY_FORM_STEPS } from "./FormSteps";
import Databases from "./management/Databases";
import Description from "./management/Description";
import Reports from "./management/Reports";
import Tools from "./management/Tools";
import ZoomAndCentering from "./management/ZoomAndCentering";
import Layers from "./management/Layers";

const CreateCommunity: FC = () => {
    const { data: me, isLoading: isMeLoading, isError: isMeError, error: meError } = useUserMe();

    const { t: tCommon } = useTranslation("Common");
    const { t: tBreadcrumb } = useTranslation("Breadcrumb");
    const { t: tmc } = useTranslation("ManageCommunity");
    const { t } = useTranslation("CreateCommunity");

    const context = useCommunityContext();
    const { currentStep, community, isCommunityLoading, isCommunityUpdating, isCommunityUpdatingError, updatingCommunityError } = context;
    const stepper = context.stepper!;

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

    // S'il est active === true, il peut être modifié mais ne peut pas être en cours de creation
    const forbidden = useMemo(() => {
        if (community) {
            return community.active === true;
        }
        return false;
    }, [community]);

    return (
        <Main
            customBreadcrumbProps={{
                homeLinkProps: routes.discover().link,
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
                        stepCount={stepper.maxSteps}
                        title={t("step_title", { step: currentStep })}
                        nextTitle={!stepper.isLastStep() ? t("step_title", { step: currentStep + 1 }) : ""}
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
                    {isMeLoading ? (
                        <LoadingText as={"h6"} message={tmc("loading_me")} />
                    ) : isMeError ? (
                        <Alert
                            severity="error"
                            closable={false}
                            title={tmc("me_fetch_failed")}
                            description={
                                <>
                                    <p>{meError.message}</p>
                                    <Button linkProps={routes.espaceco_community_list().link}>{t("back_to_list")}</Button>
                                </>
                            }
                        />
                    ) : isCommunityLoading ? (
                        <LoadingText as={"h6"} message={tmc("loading")} />
                    ) : hasRights === false ? (
                        <Alert severity="error" closable={false} title={t("no_rights")} />
                    ) : forbidden ? (
                        <Alert severity="error" closable={false} title={t("forbidden_access")} />
                    ) : (
                        community && (
                            <div>
                                {currentStep === COMMUNITY_FORM_STEPS.DESCRIPTION ? (
                                    <Description isAdmin={isAdmin} />
                                ) : currentStep === COMMUNITY_FORM_STEPS.DATABASE ? (
                                    <Databases />
                                ) : currentStep === COMMUNITY_FORM_STEPS.LAYERS ? (
                                    <Layers />
                                ) : currentStep === COMMUNITY_FORM_STEPS.ZOOM_AND_CENTERING ? (
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

import Stepper from "@codegouvfr/react-dsfr/Stepper";
import { FC } from "react";
import { useTranslation } from "../../../i18n/i18n";
import { CommunityFormMode } from "../../../@types/app_espaceco";

enum COMMUNITY_FORM_STEPS {
    DESCRIPTION = 1,
    DATABASE = 2,
    LAYERS = 3,
    ZOOM_AND_CENTERING = 4,
    TOOLS = 5,
    REPORTS = 6,
    GRIDS = 7,
    MEMBERS = 8,
}

const getMaxSteps = (mode: CommunityFormMode) => (mode === "creation" ? COMMUNITY_FORM_STEPS.REPORTS : COMMUNITY_FORM_STEPS.MEMBERS);

type CommunityStepperProps = {
    mode: CommunityFormMode;
    currentStep: number;
};

const CommunityStepper: FC<CommunityStepperProps> = ({ mode, currentStep }) => {
    const { t } = useTranslation("CreateCommunity");

    const numStep = getMaxSteps(mode);

    return (
        <Stepper
            currentStep={currentStep}
            stepCount={numStep}
            title={t("step_title", { stepNumber: currentStep })}
            nextTitle={currentStep < numStep ? t("step_title", { stepNumber: currentStep + 1 }) : ""}
        />
    );
};

export { COMMUNITY_FORM_STEPS, getMaxSteps, CommunityStepper };

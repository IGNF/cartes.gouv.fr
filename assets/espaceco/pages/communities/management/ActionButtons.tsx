import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { FC } from "react";
import { useTranslation } from "../../../../i18n";
import { COMMUNITY_FORM_STEPS, getMaxSteps } from "../FormSteps";

type ActionButtonsProps = {
    step: COMMUNITY_FORM_STEPS;
    onPrevious?: () => void;
    onSave: () => void;
    onContinue: () => void;
};

const lastStep = getMaxSteps("creation");

const ActionButtons: FC<ActionButtonsProps> = ({ step, onPrevious, onSave, onContinue }) => {
    const { t: tCommon } = useTranslation("Common");

    return (
        <div className={fr.cx("fr-grid-row", "fr-my-2w")}>
            <div className="fr-col-6">
                <div className="fr-grid-row fr-grid-row--left">
                    <Button
                        priority={"secondary"}
                        iconId={"fr-icon-arrow-left-fill"}
                        onClick={() => onPrevious?.()}
                        disabled={step === COMMUNITY_FORM_STEPS.DESCRIPTION}
                    >
                        {tCommon("previous_step")}
                    </Button>
                </div>
            </div>
            <div className="fr-col-6">
                <div className="fr-grid-row fr-grid-row--right">
                    <Button priority={"primary"} onClick={onSave}>
                        {tCommon("save")}
                    </Button>
                    {step < lastStep && (
                        <Button className={fr.cx("fr-ml-2v")} priority="primary" onClick={onContinue}>
                            {tCommon("continue")}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ActionButtons;

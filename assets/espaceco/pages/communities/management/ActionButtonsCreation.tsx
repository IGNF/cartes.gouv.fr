import { useCommunityContext } from "@/espaceco/contexts/CommunityContext";
import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { FC } from "react";
import { useTranslation } from "../../../../i18n";

type ActionButtonsCreationProps = {
    onSave: () => void;
    onContinue: () => void;
};

const ActionButtonsCreation: FC<ActionButtonsCreationProps> = ({ onSave, onContinue }) => {
    const { t: tCommon } = useTranslation("Common");
    const { t: tmc } = useTranslation("ManageCommunity");

    const { isFirstStep, isLastStep, previousStep } = useCommunityContext();

    return (
        <div className={fr.cx("fr-grid-row", "fr-my-2w")}>
            <div className="fr-col-6">
                <div className="fr-grid-row fr-grid-row--left">
                    <Button priority={"secondary"} iconId={"fr-icon-arrow-left-fill"} onClick={() => previousStep()} disabled={isFirstStep()}>
                        {tCommon("previous_step")}
                    </Button>
                </div>
            </div>
            <div className="fr-col-6">
                <div className="fr-grid-row fr-grid-row--right">
                    <Button priority={"primary"} onClick={onSave}>
                        {tCommon("save")}
                    </Button>
                    <Button className={fr.cx("fr-ml-2v")} priority="primary" onClick={onContinue}>
                        {!isLastStep() ? tCommon("continue") : tmc("create_now")}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ActionButtonsCreation;

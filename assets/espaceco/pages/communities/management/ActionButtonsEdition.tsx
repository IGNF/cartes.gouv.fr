import Button from "@codegouvfr/react-dsfr/Button";
import { FC } from "react";
import { useTranslation } from "../../../../i18n";

type ActionButtonsEditionProps = {
    onSave: () => void;
};

const ActionButtonsEdition: FC<ActionButtonsEditionProps> = ({ onSave }) => {
    const { t: tCommon } = useTranslation("Common");

    return (
        <div className="fr-grid-row fr-grid-row--right">
            <Button priority={"primary"} onClick={onSave}>
                {tCommon("save")}
            </Button>
        </div>
    );
};

export default ActionButtonsEdition;

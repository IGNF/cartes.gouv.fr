import { fr } from "@codegouvfr/react-dsfr";
import { FC, ReactNode } from "react";

import { useTranslation } from "../../i18n/i18n";
import LoadingText from "./LoadingText";
import Wait from "./Wait";

type LoadingOverlayProps = {
    message?: ReactNode;
};

const LoadingOverlay: FC<LoadingOverlayProps> = ({ message }) => {
    const { t } = useTranslation("Common");

    return (
        <Wait>
            <div className={fr.cx("fr-grid-row")} role="status">
                <LoadingText as="h6" message={message ?? t("loading")} withSpinnerIcon={true} />
            </div>
        </Wait>
    );
};

export default LoadingOverlay;

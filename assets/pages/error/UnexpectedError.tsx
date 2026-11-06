import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { FC } from "react";

import Main from "@/components/Layout/Main";
import { useTranslation } from "@/i18n";

interface UnexpectedErrorProps {
    message?: string;
    onRetry?: () => void;
}

// erreur inattendue (500, réseau) : ni page introuvable ni droits insuffisants
const UnexpectedError: FC<UnexpectedErrorProps> = ({ message, onRetry }) => {
    const { t } = useTranslation("Common");

    return (
        <Main title={t("error")}>
            <Alert className={fr.cx("fr-mb-2w")} title={t("error")} description={message} severity="error" />
            {onRetry && (
                <Button priority="secondary" onClick={() => onRetry()}>
                    {t("retry")}
                </Button>
            )}
        </Main>
    );
};

export default UnexpectedError;

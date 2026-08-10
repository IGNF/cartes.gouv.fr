import { fr } from "@codegouvfr/react-dsfr";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { FC, PropsWithChildren } from "react";
import { ErrorBoundary as BaseErrorBoundary, type FallbackProps, getErrorMessage } from "react-error-boundary";

import { externalUrls } from "@/router/externalUrls";

function Fallback({ error, resetErrorBoundary }: FallbackProps) {
    return (
        <div className={fr.cx("fr-container", "fr-my-6w")}>
            <h1>Une erreur est survenue</h1>
            <Alert severity="error" title="Une erreur est survenue" description={getErrorMessage(error) ?? undefined} className={fr.cx("fr-my-3w")} />
            <Button
                onClick={() => {
                    resetErrorBoundary();
                    window.location.assign(externalUrls.discover_cartesgouvfr);
                }}
            >
                {"Retour à l'accueil"}
            </Button>
        </div>
    );
}

const ErrorBoundary: FC<PropsWithChildren> = ({ children }) => {
    return (
        <BaseErrorBoundary
            FallbackComponent={Fallback}
            onError={(error, info) => {
                console.error(error, info);
            }}
        >
            {children}
        </BaseErrorBoundary>
    );
};

export default ErrorBoundary;

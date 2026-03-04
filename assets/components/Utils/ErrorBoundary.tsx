import { fr } from "@codegouvfr/react-dsfr";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { FC, PropsWithChildren } from "react";
import { ErrorBoundary as BaseErrorBoundary, type FallbackProps, getErrorMessage } from "react-error-boundary";

import { routes } from "../../router/router";
import AppLayout from "../Layout/AppLayout";
import Main from "../Layout/Main";

function Fallback({ error, resetErrorBoundary }: FallbackProps) {
    return (
        <AppLayout>
            <Main title="Une erreur est survenue">
                <Alert severity="error" title="Une erreur est survenue" description={getErrorMessage(error) ?? undefined} className={fr.cx("fr-my-3w")} />
                <Button
                    onClick={() => {
                        resetErrorBoundary();
                        routes.discover_publish().push();
                    }}
                >
                    {"Retour à l'accueil"}
                </Button>
            </Main>
        </AppLayout>
    );
}

const ErrorBoundary: FC<PropsWithChildren> = ({ children }) => {
    return (
        <BaseErrorBoundary
            FallbackComponent={Fallback}
            onReset={(details) => {
                // Reset the state of your app so the error doesn't happen again
                console.log(details);
            }}
        >
            {children}
        </BaseErrorBoundary>
    );
};

export default ErrorBoundary;

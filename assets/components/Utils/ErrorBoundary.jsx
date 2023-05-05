import { fr } from "@codegouvfr/react-dsfr";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import PropTypes from "prop-types";
import React from "react";
import { ErrorBoundary as BaseErrorBoundary } from "react-error-boundary";

import { defaultNavItems } from "../../config/navItems";
import { routes } from "../../router/router";
import AppLayout from "../Layout/AppLayout";

function Fallback({ error, resetErrorBoundary }) {
    return (
        <AppLayout navItems={defaultNavItems}>
            <Alert severity="error" title="Une erreur est survenue" description={error?.message} className={fr.cx("fr-my-3w")} />
            <Button
                onClick={() => {
                    resetErrorBoundary();
                    routes.home().push();
                }}
            >
                {"Retour à l'accueil"}
            </Button>
        </AppLayout>
    );
}

Fallback.propTypes = {
    error: PropTypes.object,
    resetErrorBoundary: PropTypes.func,
};

const ErrorBoundary = ({ children }) => {
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

ErrorBoundary.propTypes = {
    children: PropTypes.node,
};

export default ErrorBoundary;

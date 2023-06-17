import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import PropTypes from "prop-types";
import React, { useEffect, useRef, useState } from "react";

import api from "../../../api";
import Wait from "../../../components/Utils/Wait";

import "./../../../sass/components/spinner.scss";

const DataNewIntegration = ({ datastoreId, uploadId }) => {
    const [integrationProgress, setIntegrationProgress] = useState({});
    const [integrationCurrentStep, setIntegrationCurrentStep] = useState(null);

    const abortController = useRef(new AbortController());
    const [requestInProgress, setRequestInProgress] = useState(false);

    const refreshInterval = useRef();

    useEffect(() => {
        refreshInterval.current = setInterval(refresh, 5000);

        return () => {
            if (refreshInterval.current) {
                clearInterval(refreshInterval.current);
            }
            // abortController?.current?.abort();
        };
    }, []);

    useEffect(() => {
        // stopper si une étape a échoué
        if (Object.values(integrationProgress).includes("failed")) {
            console.debug("stopping, one step failed");
            clearInterval(refreshInterval.current);
            return;
        }

        // stopper si toutes les étapes ont terminé
        if (Object.keys(integrationProgress).length === integrationCurrentStep + 1) {
            console.debug("stopping, all steps completed");
            clearInterval(refreshInterval.current);
            return;
        }
    }, [integrationProgress]);

    const refresh = () => {
        if (requestInProgress) return;

        setRequestInProgress(true);
        const signal = abortController.current.signal;
        api.upload
            .integrationProgressPing(datastoreId, uploadId, { signal })
            .then((response) => {
                setIntegrationProgress({ ...JSON.parse(response?.integration_progress) });
                setIntegrationCurrentStep(parseInt(response?.integration_current_step));
            })
            .catch((error) => {
                console.error(error);
            })
            .finally(() => {
                setRequestInProgress(false);
            });
    };

    const getStepIcon = (status) => {
        let iconClass = fr.cx("fr-icon-time-line");

        switch (status) {
            case "in_progress":
                iconClass = fr.cx("fr-icon-refresh-line", "icons-spin");
                break;
            case "successful":
                iconClass = fr.cx("fr-icon-checkbox-line");
                break;
            case "failed":
                iconClass = fr.cx("fr-icon-close-circle-line");
                break;
            case "waiting":
            default:
                break;
        }
        return <i className={iconClass} />;
    };

    return (
        <Wait show={true}>
            <div className={fr.cx("fr-container")}>
                <div className={fr.cx("fr-grid-row")}>
                    <div className={fr.cx("fr-col-1")}>
                        <i className={fr.cx("fr-icon-refresh-line", "fr-icon--lg", "icons-spin")} />
                    </div>
                    <div className={fr.cx("fr-col-11")}>
                        <h6 className={fr.cx("fr-h6")}>Vos données vecteur sont en cours de dépôt</h6>
                    </div>
                </div>
                <div className={fr.cx("fr-grid-row", "fr-px-4w")}>
                    <div className={fr.cx("fr-col", "fr-col--middle")}>
                        {Object.entries(integrationProgress).map(([step, status]) => (
                            <div className={fr.cx("fr-grid-row")} key={step}>
                                <p>
                                    {getStepIcon(status)}
                                    &nbsp;{Translator.trans(`data.new_integration.steps.${step}`)} : {status}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className={fr.cx("fr-grid-row", "fr-grid-row--right")}>
                    <Button onClick={() => {}} disabled={true}>
                        Continuer
                    </Button>
                </div>
            </div>
        </Wait>
    );
};

DataNewIntegration.propTypes = {
    datastoreId: PropTypes.string,
    uploadId: PropTypes.string,
};

export default DataNewIntegration;

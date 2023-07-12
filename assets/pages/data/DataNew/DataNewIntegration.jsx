import { fr } from "@codegouvfr/react-dsfr";
import { useQuery } from "@tanstack/react-query";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";

import api from "../../../api";
import { routes } from "../../../router/router";

import reactQueryKeys from "../../../modules/reactQueryKeys";
import "./../../../sass/components/spinner.scss";

const DataNewIntegration = ({ datastoreId, uploadId, dataName }) => {
    const [integrationProgress, setIntegrationProgress] = useState({});
    const [integrationCurrentStep, setIntegrationCurrentStep] = useState(null);

    // fetch integration progress
    const abortController = new AbortController();
    const [shouldFetchIntProg, setShouldFetchIntProg] = useState(true);
    const integrationQuery = useQuery({
        queryKey: [reactQueryKeys.datastore_upload_integration(datastoreId, uploadId)],
        queryFn: () => api.upload.integrationProgressPing(datastoreId, uploadId, { signal: abortController?.signal }),
        refetchInterval: 3000,
        refetchIntervalInBackground: true,
        enabled: shouldFetchIntProg,
    });

    // mise à jour de integrationProgress et integrationCurrentStep à chaque refetch de integrationQuery
    useEffect(() => {
        const response = integrationQuery?.data;
        if (response) {
            setIntegrationProgress(JSON.parse(response?.integration_progress));
            setIntegrationCurrentStep(parseInt(response?.integration_current_step));
        }
    }, [integrationQuery?.data]);

    useEffect(() => {
        // stopper si une étape a échoué
        if (Object.values(integrationProgress).includes("failed")) {
            console.debug("stopping, one step failed");
            setShouldFetchIntProg(false);
            return;
        }

        // stopper si toutes les étapes ont terminé
        if (Object.keys(integrationProgress).length === integrationCurrentStep) {
            console.debug("stopping, all steps completed successfully");
            setShouldFetchIntProg(false);

            routes.datastore_data_view({ datastoreId, dataName }).push();
        }
    }, [integrationProgress, integrationCurrentStep, datastoreId, dataName]);

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
        </div>
    );
};

DataNewIntegration.propTypes = {
    datastoreId: PropTypes.string,
    uploadId: PropTypes.string,
    dataName: PropTypes.string,
};

export default DataNewIntegration;

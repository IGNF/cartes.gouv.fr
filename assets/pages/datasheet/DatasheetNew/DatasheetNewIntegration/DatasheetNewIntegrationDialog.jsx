import { fr } from "@codegouvfr/react-dsfr";
import { useQuery } from "@tanstack/react-query";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";

import api from "../../../../api";
import reactQueryKeys from "../../../../modules/reactQueryKeys";
import { routes } from "../../../../router/router";

import "./../../../../sass/components/spinner.scss";

const DatasheetNewIntegrationDialog = ({ datastoreId, uploadId }) => {
    const [integrationProgress, setIntegrationProgress] = useState({});
    const [integrationCurrentStep, setIntegrationCurrentStep] = useState(null);

    const abortController = new AbortController();
    const [shouldPingIntProg, setShouldPingIntProg] = useState(false);

    // définition des query
    // query qui "ping" et récupère le progress en boucle (query désactivé au départ)
    const pingIntProgQuery = useQuery({
        queryKey: [reactQueryKeys.datastore_upload_integration(datastoreId, uploadId)],
        queryFn: () => api.upload.pingIntegrationProgress(datastoreId, uploadId, { signal: abortController?.signal }),
        refetchInterval: 3000,
        refetchIntervalInBackground: true,
        enabled: shouldPingIntProg,
    });

    // query qui récupère les informations sur l'upload
    const uploadQuery = useQuery({
        queryKey: [reactQueryKeys.datastore_upload(datastoreId, uploadId)],
        queryFn: () => api.upload.get(datastoreId, uploadId),
    });

    // première récupération du progress
    useEffect(() => {
        api.upload
            .getIntegrationProgress(datastoreId, uploadId)
            .then((response) => {
                setIntegrationProgress(JSON.parse(response?.integration_progress));
                setIntegrationCurrentStep(parseInt(response?.integration_current_step));
                setShouldPingIntProg(true); // là on active le query pingIntProgQuery
            })
            .catch((error) => {
                console.error(error);
            });
    }, [datastoreId, uploadId]);

    // mise à jour de integrationProgress et integrationCurrentStep à chaque refetch de integrationQuery
    useEffect(() => {
        const response = pingIntProgQuery?.data;
        if (response) {
            setIntegrationProgress(JSON.parse(response?.integration_progress));
            setIntegrationCurrentStep(parseInt(response?.integration_current_step));
        }
    }, [pingIntProgQuery?.data]);

    useEffect(() => {
        // stopper si une étape a échoué
        if (Object.values(integrationProgress).includes("failed")) {
            console.debug("stopping, one step failed");
            setShouldPingIntProg(false);
            return;
        }

        // stopper si toutes les étapes ont terminé
        if (Object.keys(integrationProgress).length === integrationCurrentStep) {
            console.debug("stopping, all steps completed successfully");
            setShouldPingIntProg(false);

            routes.datastore_datasheet_view({ datastoreId, datasheetName: uploadQuery?.data?.tags?.data_name }).push();
        }
    }, [integrationProgress, integrationCurrentStep, datastoreId, uploadQuery?.data]);

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

    const getStepStatusText = (status) => {
        let statusText = "";
        switch (status) {
            case "in_progress":
                statusText = "En cours";
                break;
            case "successful":
                statusText = "Succès";
                break;
            case "failed":
                statusText = "Echèc";
                break;
            case "waiting":
                statusText = "En attente";
        }
        return statusText;
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
                                &nbsp;{Translator.trans(`data.new_integration.steps.${step}`)} : {getStepStatusText(status)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

DatasheetNewIntegrationDialog.propTypes = {
    datastoreId: PropTypes.string,
    uploadId: PropTypes.string,
};

export default DatasheetNewIntegrationDialog;

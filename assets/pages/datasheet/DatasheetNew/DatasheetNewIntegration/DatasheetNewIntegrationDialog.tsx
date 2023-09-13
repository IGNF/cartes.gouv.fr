import { fr } from "@codegouvfr/react-dsfr";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import { useQuery } from "@tanstack/react-query";
import { FC, useEffect, useState } from "react";

import api from "../../../../api";
import RQKeys from "../../../../modules/RQKeys";
import Translator from "../../../../modules/Translator";
import { routes } from "../../../../router/router";

import "./../../../../sass/components/spinner.scss";

type DatasheetNewIntegrationDialogProps = {
    datastoreId: string;
    uploadId: string;
};

const DatasheetNewIntegrationDialog: FC<DatasheetNewIntegrationDialogProps> = ({ datastoreId, uploadId }) => {
    const [integrationProgress, setIntegrationProgress] = useState({});
    const [integrationCurrentStep, setIntegrationCurrentStep] = useState<number>();

    const [shouldPingIntProg, setShouldPingIntProg] = useState(false);

    const [isIntegrationError, setIsIntegrationError] = useState(false);

    // définition des query
    // query qui "ping" et récupère le progress en boucle (query désactivé au départ)
    const pingIntProgQuery = useQuery({
        queryKey: RQKeys.datastore_upload_integration(datastoreId, uploadId),
        queryFn: ({ signal }) => api.upload.pingIntegrationProgress(datastoreId, uploadId, { signal }),
        refetchInterval: 3000,
        refetchIntervalInBackground: true,
        enabled: shouldPingIntProg,
    });

    // query qui récupère les informations sur l'upload
    const uploadQuery = useQuery({
        queryKey: RQKeys.datastore_upload(datastoreId, uploadId),
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
            setIsIntegrationError(true);
            return;
        }

        // stopper si toutes les étapes ont terminé
        if (Object.keys(integrationProgress).length === integrationCurrentStep) {
            console.debug("stopping, all steps completed successfully");
            setShouldPingIntProg(false);

            if (uploadQuery?.data?.tags?.datasheet_name) {
                routes.datastore_datasheet_view({ datastoreId, datasheetName: uploadQuery?.data?.tags?.datasheet_name }).push();
            }
        }
    }, [integrationProgress, integrationCurrentStep, datastoreId, uploadQuery?.data]);

    const getStepIcon = (status) => {
        let iconClass = fr.cx("fr-icon-time-line");

        switch (status) {
            case "in_progress":
                iconClass = fr.cx("fr-icon-refresh-line") + " icons-spin";
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
            {isIntegrationError ? (
                <div className={fr.cx("fr-grid-row")}>
                    <div className={fr.cx("fr-col-1")}>
                        <i className={fr.cx("fr-icon-close-circle-line", "fr-icon--lg")} />
                    </div>
                    <div className={fr.cx("fr-col-11")}>
                        <h6 className={fr.cx("fr-h6")}>{"L'intégration de vos données a échoué"}</h6>
                    </div>
                </div>
            ) : (
                <div className={fr.cx("fr-grid-row")}>
                    <div className={fr.cx("fr-col-1")}>
                        <i className={fr.cx("fr-icon-refresh-line", "fr-icon--lg") + " icons-spin"} />
                    </div>
                    <div className={fr.cx("fr-col-11")}>
                        <h6 className={fr.cx("fr-h6")}>Vos données vecteur sont en cours de dépôt</h6>
                    </div>
                </div>
            )}

            <div className={fr.cx("fr-grid-row", "fr-px-4w")}>
                <div className={fr.cx("fr-col", "fr-col--middle")}>
                    {Object.entries(integrationProgress).map(([step, status]) => (
                        <div className={fr.cx("fr-grid-row")} key={step}>
                            <p>
                                {getStepIcon(status)}
                                &nbsp;{Translator.trans(`datasheet.new_integration.steps.${step}`)} : {getStepStatusText(status)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {isIntegrationError && (
                <div className={fr.cx("fr-grid-row")}>
                    <ButtonsGroup
                        buttons={[
                            {
                                children: "Voir le rapport d'erreur",
                                linkProps: { href: "#" },
                            },
                            {
                                children: "Revenir à mes données",
                                linkProps: routes.datasheet_list({ datastoreId }).link,
                            },
                        ]}
                        inlineLayoutWhen="always"
                    />
                </div>
            )}
        </div>
    );
};

export default DatasheetNewIntegrationDialog;

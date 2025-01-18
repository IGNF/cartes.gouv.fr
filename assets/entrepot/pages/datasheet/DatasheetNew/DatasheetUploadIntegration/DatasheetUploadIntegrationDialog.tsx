import { fr } from "@codegouvfr/react-dsfr";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, useEffect, useMemo, useState } from "react";

import LoadingIcon from "../../../../../components/Utils/LoadingIcon";
import { useTranslation } from "../../../../../i18n";
import RQKeys from "../../../../../modules/entrepot/RQKeys";
import { routes } from "../../../../../router/router";
import api from "../../../../api";
import { DatasheetViewActiveTabEnum } from "../../DatasheetView/DatasheetView/DatasheetView";

const getStepIcon = (status: string) => {
    let icon = <span className={fr.cx("fr-icon-time-line")} />;

    switch (status) {
        case "in_progress":
            icon = <LoadingIcon />;
            break;
        case "successful":
            icon = <span className={fr.cx("fr-icon-checkbox-line")} />;
            break;
        case "failed":
            icon = <span className={fr.cx("fr-icon-close-circle-line")} />;
            break;
        case "waiting":
        default:
            break;
    }
    return icon;
};

type IntegrationStatus = "at_least_one_failure" | "proc_int_launched" | "all_successful";

type DatasheetUploadIntegrationDialogProps = {
    datastoreId: string;
    datasheetName: string | undefined;
    uploadId: string;
};

const DatasheetUploadIntegrationDialog: FC<DatasheetUploadIntegrationDialogProps> = ({ datastoreId, datasheetName, uploadId }) => {
    const { t } = useTranslation("DatasheetUploadIntegration");

    const [shouldPingIntProg, setShouldPingIntProg] = useState<boolean>(true);

    const queryClient = useQueryClient();

    // définition des query
    // query qui "ping" ou "poll" et récupère le progress en boucle (query désactivé au départ)
    const pingIntProgQuery = useQuery({
        queryKey: RQKeys.datastore_upload_integration(datastoreId, uploadId),
        queryFn: ({ signal }) =>
            pingIntProgQuery.data === undefined
                ? api.upload.getIntegrationProgress(datastoreId, uploadId, { signal })
                : api.upload.pingIntegrationProgress(datastoreId, uploadId, { signal }),
        refetchInterval: 3000,
        refetchIntervalInBackground: true,
        enabled: shouldPingIntProg,
        staleTime: 0,
        refetchOnMount: "always",
    });

    // query qui récupère les informations sur l'upload
    const uploadQuery = useQuery({
        queryKey: RQKeys.datastore_upload(datastoreId, uploadId),
        queryFn: ({ signal }) => api.upload.get(datastoreId, uploadId, { signal }),
        enabled: !pingIntProgQuery.isFetching,
    });

    // mise à jour de integrationProgress et integrationCurrentStep à chaque refetch de pingIntProgQuery
    const {
        integrationProgress,
        integrationCurrentStep,
    }: {
        integrationProgress: Record<string, string> | null;
        integrationCurrentStep: number;
    } = useMemo(
        () => ({
            integrationProgress: pingIntProgQuery?.data?.integration_progress ? JSON.parse(pingIntProgQuery?.data?.integration_progress) : null,
            integrationCurrentStep: pingIntProgQuery?.data?.integration_current_step ? parseInt(pingIntProgQuery?.data?.integration_current_step) : 0,
        }),
        [pingIntProgQuery?.data]
    );

    const integrationStatus: IntegrationStatus | undefined = useMemo(() => {
        if (integrationProgress && Object.values(integrationProgress).includes("failed")) {
            // au moins une étape a échoué
            return "at_least_one_failure";
        }

        if (integrationProgress && integrationProgress?.["integration_processing"] === "in_progress") {
            // le traitement d'intégration en bd a été lancé
            return "proc_int_launched";
        }

        if (integrationProgress && Object.keys(integrationProgress).length === integrationCurrentStep) {
            // toutes les étapes sont terminées avec succès
            return "all_successful";
        }
    }, [integrationProgress, integrationCurrentStep]);

    useEffect(() => {
        switch (integrationStatus) {
            case "at_least_one_failure":
                setShouldPingIntProg(false);
                break;
            case "proc_int_launched":
                // ne rien faire
                break;
            case "all_successful":
                setShouldPingIntProg(false);

                if (uploadQuery?.data?.tags?.datasheet_name) {
                    queryClient.invalidateQueries({
                        queryKey: RQKeys.datastore_datasheet(datastoreId, uploadQuery?.data?.tags?.datasheet_name),
                    });
                    routes
                        .datastore_datasheet_view({
                            datastoreId,
                            datasheetName: uploadQuery?.data?.tags?.datasheet_name,
                            activeTab: DatasheetViewActiveTabEnum.Dataset,
                        })
                        .push();
                }
                break;
        }
    }, [integrationStatus, datastoreId, uploadQuery?.data?.tags.datasheet_name, queryClient]);

    return (
        <div className={fr.cx("fr-container")}>
            {integrationStatus === "at_least_one_failure" ? (
                <div className={fr.cx("fr-grid-row")}>
                    <div className={fr.cx("fr-col")}>
                        <h6 className={fr.cx("fr-h6")}>
                            <i className={fr.cx("fr-icon-close-circle-line", "fr-icon--lg")} /> {"L’intégration de vos données a échoué"}
                        </h6>
                    </div>
                </div>
            ) : (
                <>
                    <div className={fr.cx("fr-grid-row")}>
                        <div className={fr.cx("fr-col")}>
                            <h6 className={fr.cx("fr-h6")}>
                                <LoadingIcon largeIcon={true} /> {t("data_integration_in_progress")}
                            </h6>
                        </div>
                    </div>
                    <div className={fr.cx("fr-grid-row")}>
                        <div className={fr.cx("fr-col")}>
                            <p>{t("long_operation_information")}</p>
                        </div>
                    </div>
                </>
            )}

            <div className={fr.cx("fr-grid-row", "fr-px-4w")}>
                <div className={fr.cx("fr-col", "fr-col--middle")}>
                    {integrationProgress &&
                        Object.entries(integrationProgress).map(([step, status]) => (
                            <div className={fr.cx("fr-grid-row")} key={step}>
                                <p>
                                    {getStepIcon(status)}
                                    &nbsp;{t("step_title", { step_name: step })} : {t("step_status_text", { step_status: status })}
                                </p>
                            </div>
                        ))}
                </div>
            </div>

            {integrationStatus === "proc_int_launched" && <p>{t("continue_browsing_data_not_ready")}</p>}

            {(integrationStatus === "all_successful" || integrationStatus === "proc_int_launched") && uploadQuery.data?.tags.datasheet_name !== undefined && (
                <div className={fr.cx("fr-grid-row")}>
                    <ButtonsGroup
                        buttons={[
                            {
                                children: "Consulter la fiche de données",
                                onClick: () => {
                                    uploadQuery.data?.tags.datasheet_name &&
                                        (queryClient.refetchQueries({
                                            queryKey: RQKeys.datastore_datasheet(datastoreId, uploadQuery.data?.tags.datasheet_name),
                                        }),
                                        routes
                                            .datastore_datasheet_view({
                                                datastoreId,
                                                datasheetName: uploadQuery.data?.tags.datasheet_name,
                                                activeTab: DatasheetViewActiveTabEnum.Dataset,
                                            })
                                            .push());
                                },
                            },
                        ]}
                        inlineLayoutWhen="always"
                    />
                </div>
            )}

            {integrationStatus === "at_least_one_failure" && uploadQuery.data?.tags.datasheet_name !== undefined && (
                <div className={fr.cx("fr-grid-row")}>
                    <ButtonsGroup
                        buttons={[
                            {
                                children: t("view_datasheet"),
                                onClick: () => {
                                    uploadQuery.data?.tags.datasheet_name &&
                                        (queryClient.refetchQueries({
                                            queryKey: RQKeys.datastore_datasheet(datastoreId, uploadQuery.data?.tags.datasheet_name),
                                        }),
                                        routes
                                            .datastore_datasheet_view({
                                                datastoreId,
                                                datasheetName: uploadQuery.data?.tags.datasheet_name,
                                                activeTab: DatasheetViewActiveTabEnum.Dataset,
                                            })
                                            .push());
                                },
                            },
                        ]}
                        inlineLayoutWhen="always"
                    />
                </div>
            )}

            {integrationStatus === "at_least_one_failure" && uploadQuery.data?.tags?.vectordb_id !== undefined && (
                <div className={fr.cx("fr-grid-row")}>
                    <ButtonsGroup
                        buttons={[
                            {
                                children: t("check_error_report"),
                                linkProps: routes.datastore_stored_data_details({
                                    datastoreId,
                                    storedDataId: uploadQuery.data?.tags?.vectordb_id,
                                    datasheetName,
                                }).link,
                            },
                            {
                                children: t("back_to_datasheet_list"),
                                linkProps: routes.datasheet_list({ datastoreId }).link,
                                priority: "secondary",
                            },
                        ]}
                        inlineLayoutWhen="always"
                    />
                </div>
            )}
        </div>
    );
};

export default DatasheetUploadIntegrationDialog;

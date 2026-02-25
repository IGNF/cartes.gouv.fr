import { fr } from "@codegouvfr/react-dsfr";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, useEffect, useMemo, useState } from "react";

import { Upload } from "@/@types/app";
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

const parseIntegrationProgress = (rawProgress: string | undefined): Record<string, string> | null => {
    if (!rawProgress) {
        return null;
    }

    try {
        const parsed = JSON.parse(rawProgress);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
            return parsed as Record<string, string>;
        }
    } catch {
        // ignore JSON parse errors
    }

    return null;
};

type IntegrationStatus = "at_least_one_failure" | "proc_int_launched" | "all_successful";

type IntegrationStreamPayload = {
    integration_progress?: string;
    integration_current_step?: string;
    upload?: Upload;
};

type DatasheetUploadIntegrationDialogProps = {
    datastoreId: string;
    datasheetName: string | undefined;
    uploadId: string;
};

const DatasheetUploadIntegrationDialog: FC<DatasheetUploadIntegrationDialogProps> = ({ datastoreId, datasheetName, uploadId }) => {
    const { t } = useTranslation("DatasheetUploadIntegration");

    const [shouldPingIntProg, setShouldPingIntProg] = useState<boolean>(true);
    const [useSse, setUseSse] = useState<boolean>(true);
    const [sseData, setSseData] = useState<IntegrationStreamPayload | null>(null);

    const queryClient = useQueryClient();

    // définition des query
    // query qui "ping" ou "poll" et récupère le progress en boucle
    const pingIntProgQuery = useQuery({
        // eslint-disable-next-line @tanstack/query/exhaustive-deps
        queryKey: RQKeys.datastore_upload_integration(datastoreId, uploadId),
        queryFn: ({ signal }) =>
            pingIntProgQuery.data === undefined
                ? api.upload.getIntegrationProgress(datastoreId, uploadId, { signal })
                : api.upload.pingIntegrationProgress(datastoreId, uploadId, { signal }),
        refetchInterval: shouldPingIntProg && !useSse ? 3000 : false,
        refetchIntervalInBackground: true,
        enabled: shouldPingIntProg && !useSse,
        staleTime: 0,
        refetchOnMount: "always",
    });

    useEffect(() => {
        setUseSse(typeof window !== "undefined" && "EventSource" in window);
    }, []);

    const sourceData = useSse ? sseData : pingIntProgQuery?.data;

    useEffect(() => {
        if (!useSse || !shouldPingIntProg) {
            return;
        }

        const url = api.upload.getIntegrationStreamUrl(datastoreId, uploadId, !sourceData);
        const eventSource = new EventSource(url);

        const handleMessage = (event: MessageEvent<string>) => {
            try {
                const data = JSON.parse(event.data) as IntegrationStreamPayload;
                setSseData(data);
            } catch {
                // erreur de parsing ignoree
            }
        };

        eventSource.addEventListener("progress", handleMessage as EventListener);
        eventSource.addEventListener("message", handleMessage as EventListener);

        eventSource.onerror = (event) => {
            console.error("SSE error", {
                readyState: eventSource.readyState,
                url,
                event,
            });

            if (eventSource.readyState === EventSource.CLOSED) {
                console.warn("SSE closed, falling back to polling", { url });
                setUseSse(false);
            }
        };

        return () => {
            eventSource.removeEventListener("progress", handleMessage as EventListener);
            eventSource.removeEventListener("message", handleMessage as EventListener);
            eventSource.close();
        };
    }, [useSse, shouldPingIntProg, datastoreId, uploadId, sourceData]);

    // mise à jour de integrationProgress et integrationCurrentStep à chaque refetch de pingIntProgQuery

    const {
        integrationProgress,
        upload,
    }: {
        integrationProgress: Record<string, string> | null;
        upload: Upload | undefined;
    } = useMemo(
        () => ({
            upload: sourceData?.upload,
            integrationProgress: parseIntegrationProgress(sourceData?.integration_progress),
        }),
        [sourceData]
    );

    const integrationStatus: IntegrationStatus | undefined = useMemo(() => {
        if (!integrationProgress) {
            return undefined;
        }

        const stepStatuses = Object.values(integrationProgress);

        if (stepStatuses.includes("failed")) {
            // au moins une étape a échoué
            return "at_least_one_failure";
        }

        if (integrationProgress["integration_processing"] === "in_progress") {
            // le traitement d'intégration en bd a été lancé
            return "proc_int_launched";
        }

        // Le backend garantit 3 étapes au total.
        const allSuccessful = stepStatuses.length === 3 && stepStatuses.every((s) => s === "successful");
        if (allSuccessful) {
            // toutes les étapes sont terminées avec succès
            return "all_successful";
        }
    }, [integrationProgress]);

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

                if (upload?.tags?.datasheet_name) {
                    queryClient.invalidateQueries({
                        queryKey: RQKeys.datastore_datasheet(datastoreId, upload?.tags?.datasheet_name),
                    });
                    routes
                        .datastore_datasheet_view({
                            datastoreId,
                            datasheetName: upload?.tags?.datasheet_name,
                            activeTab: DatasheetViewActiveTabEnum.Dataset,
                        })
                        .push();
                }
                break;
        }
    }, [integrationStatus, datastoreId, upload?.tags?.datasheet_name, queryClient]);

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

            {(integrationStatus === "all_successful" || integrationStatus === "proc_int_launched") && upload?.tags?.datasheet_name !== undefined && (
                <div className={fr.cx("fr-grid-row")}>
                    <ButtonsGroup
                        buttons={[
                            {
                                children: "Consulter la fiche de données",
                                onClick: () => {
                                    if (upload?.tags?.datasheet_name) {
                                        queryClient.refetchQueries({
                                            queryKey: RQKeys.datastore_datasheet(datastoreId, upload?.tags?.datasheet_name),
                                        });
                                        routes
                                            .datastore_datasheet_view({
                                                datastoreId,
                                                datasheetName: upload?.tags?.datasheet_name,
                                                activeTab: DatasheetViewActiveTabEnum.Dataset,
                                            })
                                            .push();
                                    }
                                },
                            },
                        ]}
                        inlineLayoutWhen="always"
                    />
                </div>
            )}

            {integrationStatus === "at_least_one_failure" && upload?.tags?.datasheet_name !== undefined && (
                <div className={fr.cx("fr-grid-row")}>
                    <ButtonsGroup
                        buttons={[
                            {
                                children: t("view_datasheet"),
                                onClick: () => {
                                    if (upload?.tags?.datasheet_name) {
                                        queryClient.refetchQueries({
                                            queryKey: RQKeys.datastore_datasheet(datastoreId, upload?.tags?.datasheet_name),
                                        });
                                        routes
                                            .datastore_datasheet_view({
                                                datastoreId,
                                                datasheetName: upload?.tags?.datasheet_name,
                                                activeTab: DatasheetViewActiveTabEnum.Dataset,
                                            })
                                            .push();
                                    }
                                },
                            },
                        ]}
                        inlineLayoutWhen="always"
                    />
                </div>
            )}

            {integrationStatus === "at_least_one_failure" && upload?.tags?.vectordb_id !== undefined && (
                <div className={fr.cx("fr-grid-row")}>
                    <ButtonsGroup
                        buttons={[
                            {
                                children: t("check_error_report"),
                                linkProps: routes.datastore_stored_data_details({
                                    datastoreId,
                                    storedDataId: upload?.tags?.vectordb_id,
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

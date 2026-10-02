import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, useCallback, useEffect, useMemo, useState } from "react";

import { Upload } from "@/@types/app";
import { parseIntegrationProgress } from "@/utils";
import RQKeys from "../../../../../modules/entrepot/RQKeys";
import { routes } from "../../../../../router/router";
import api from "../../../../api";
import { DatasheetViewActiveTabEnum } from "../../DatasheetView/DatasheetView/DatasheetView";
import DatasheetUploadIntegrationView, { IntegrationStatus } from "./DatasheetUploadIntegrationView";

type DatasheetUploadIntegrationDialogProps = {
    datastoreId: string;
    datasheetName: string | undefined;
    uploadId: string;
    /** variante de la vue fiche vers laquelle rediriger en fin d'intégration (défaut : ancienne vue) */
    datasheetViewVariant?: "classic" | "next";
};

const DatasheetUploadIntegrationDialog: FC<DatasheetUploadIntegrationDialogProps> = ({
    datastoreId,
    datasheetName,
    uploadId,
    datasheetViewVariant = "classic",
}) => {
    // route de retour vers la fiche, onglet « données » de la variante demandée
    const getDatasheetViewRoute = useCallback(
        (name: string) =>
            datasheetViewVariant === "next"
                ? routes.datastore_datasheet_view_next({ datastoreId, datasheetName: name, activeTab: "dataset" })
                : routes.datastore_datasheet_view({ datastoreId, datasheetName: name, activeTab: DatasheetViewActiveTabEnum.Dataset }),
        [datastoreId, datasheetViewVariant]
    );

    const [shouldPingIntProg, setShouldPingIntProg] = useState<boolean>(true);

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
        refetchInterval: shouldPingIntProg ? 3000 : false,
        refetchIntervalInBackground: true,
        enabled: shouldPingIntProg,
        staleTime: 0,
        refetchOnMount: "always",
    });

    // mise à jour de integrationProgress et integrationCurrentStep à chaque refetch de pingIntProgQuery
    const {
        integrationProgress,
        upload,
    }: {
        integrationProgress: Record<string, string> | null;
        upload: Upload | undefined;
    } = useMemo(
        () => ({
            upload: pingIntProgQuery?.data?.upload,
            integrationProgress: parseIntegrationProgress(pingIntProgQuery?.data?.integration_progress),
        }),
        [pingIntProgQuery?.data]
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
                    getDatasheetViewRoute(upload.tags.datasheet_name).push();
                }
                break;
        }
    }, [integrationStatus, datastoreId, upload?.tags?.datasheet_name, queryClient, getDatasheetViewRoute]);

    const handleDatasheetViewClick = useCallback(() => {
        if (upload?.tags?.datasheet_name) {
            queryClient.refetchQueries({
                queryKey: RQKeys.datastore_datasheet(datastoreId, upload?.tags?.datasheet_name),
            });
            getDatasheetViewRoute(upload.tags.datasheet_name).push();
        }
    }, [upload?.tags?.datasheet_name, queryClient, datastoreId, getDatasheetViewRoute]);

    return (
        <DatasheetUploadIntegrationView
            datastoreId={datastoreId}
            datasheetName={datasheetName}
            upload={upload}
            integrationProgress={integrationProgress}
            integrationStatus={integrationStatus}
            onDatasheetViewClick={handleDatasheetViewClick}
        />
    );
};

export default DatasheetUploadIntegrationDialog;

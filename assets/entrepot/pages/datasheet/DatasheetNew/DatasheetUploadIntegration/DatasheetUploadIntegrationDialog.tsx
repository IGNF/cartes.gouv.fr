import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { FC, useCallback, useEffect, useMemo } from "react";

import { UploadIntegration } from "@/@types/app";
import { getApiErrorMessage } from "@/modules/apiError";
import { type ApiError } from "@/modules/jsonFetch";
import { shouldAdvanceIntegration } from "@/utils";
import { useTranslation } from "../../../../../i18n";
import RQKeys from "../../../../../modules/entrepot/RQKeys";
import api from "../../../../api";
import { DatasheetViewActiveTabEnum } from "../../DatasheetView/DatasheetView/types";
import DatasheetUploadIntegrationView from "./DatasheetUploadIntegrationView";

// étape affichée « en cours » pendant que son action s’exécute côté serveur
const STEP_OF_ACTION: Partial<Record<NonNullable<UploadIntegration["next_action"]>, string>> = {
    send_files: "send_files_api",
    launch_processing: "integration_processing",
};

// plus rien ne changera : échec, ou réussite une fois la livraison supprimée
const isIntegrationFinished = (integration: UploadIntegration | undefined): boolean =>
    integration?.status === "failed" || (integration?.status === "successful" && integration.next_action === null);

type DatasheetUploadIntegrationDialogProps = {
    datastoreId: string;
    datasheetName: string | undefined;
    uploadId: string;
    /** fiche de retour : nouvelle vue ou ancienne (par défaut) */
    datasheetView?: "nouvelle";
};

const DatasheetUploadIntegrationDialog: FC<DatasheetUploadIntegrationDialogProps> = ({ datastoreId, datasheetName, uploadId, datasheetView }) => {
    const { t } = useTranslation("DatasheetUploadIntegration");
    const { t: tCommon } = useTranslation("Common");

    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const queryKey = RQKeys.datastore_upload_integration(datastoreId, uploadId);

    // exécute la prochaine action ; sa réponse remplace l’état lu
    const advance = useMutation<UploadIntegration, ApiError>({
        mutationFn: () => api.upload.advanceIntegration(datastoreId, uploadId),
        onSuccess: (state) => queryClient.setQueryData(queryKey, state),
    });
    const { mutate: advanceMutate, isPending: isAdvancing, isError: advanceFailed, data: advancedState } = advance;

    // lecture seule, en boucle ; suspendue pendant une action et après une erreur (lecture ou action)
    const integrationQuery = useQuery<UploadIntegration, ApiError>({
        queryKey,
        queryFn: ({ signal }) => api.upload.getIntegration(datastoreId, uploadId, { signal }),
        refetchInterval: (query) => (isIntegrationFinished(query.state.data) || query.state.status === "error" || isAdvancing || advanceFailed ? false : 3000),
        refetchIntervalInBackground: true,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        staleTime: 0,
        refetchOnMount: "always",
        retry: false,
    });
    const integration = integrationQuery.data;

    // une action attend : on l’exécute, une seule à la fois ; l’état renvoyé par une action attend la lecture suivante
    useEffect(() => {
        if (shouldAdvanceIntegration(integration, advancedState, isAdvancing, advanceFailed)) {
            advanceMutate();
        }
    }, [integration, advancedState, isAdvancing, advanceFailed, advanceMutate]);

    const steps = useMemo(() => {
        if (!integration) return undefined;
        const runningStep = isAdvancing && integration.next_action ? STEP_OF_ACTION[integration.next_action] : undefined;
        return Object.entries(integration.steps).map(([step, status]) => [step, step === runningStep ? "in_progress" : status] as const);
    }, [integration, isAdvancing]);

    const failed = integration?.status === "failed";
    const successful = integration?.status === "successful";
    const processingLaunched = integration?.steps["integration_processing"] === "in_progress";
    const integrationDatasheetName = integration?.datasheet_name ?? undefined;
    const error = advance.error ?? integrationQuery.error;

    // onglet Données de la fiche, dans la vue d’où vient l’utilisateur
    const goToDatasheet = useCallback(
        (name: string) =>
            datasheetView === "nouvelle"
                ? navigate({
                      to: "/tableau-de-bord/entrepots/$datastoreId/donnees/$datasheetName/nouvelle-vue",
                      params: { datastoreId, datasheetName: name },
                      search: { activeTab: DatasheetViewActiveTabEnum.Dataset },
                  })
                : navigate({
                      to: "/tableau-de-bord/entrepots/$datastoreId/donnees/$datasheetName",
                      params: { datastoreId, datasheetName: name },
                      search: { activeTab: DatasheetViewActiveTabEnum.Dataset },
                  }),
        [datasheetView, datastoreId, navigate]
    );

    // réussite : retour à la fiche une fois la livraison supprimée (ou la suppression abandonnée)
    useEffect(() => {
        if (successful && integrationDatasheetName && (integration?.next_action === null || advanceFailed)) {
            void queryClient.invalidateQueries({ queryKey: RQKeys.datastore_datasheet(datastoreId, integrationDatasheetName) });
            void goToDatasheet(integrationDatasheetName);
        }
    }, [successful, integration?.next_action, advanceFailed, datastoreId, integrationDatasheetName, queryClient, goToDatasheet]);

    return (
        <div className={fr.cx("fr-container")}>
            {error && !successful && (
                <Alert
                    className={fr.cx("fr-mb-2w")}
                    severity="error"
                    title={t("integration_error")}
                    description={
                        <>
                            <p>{getApiErrorMessage(error)}</p>
                            <Button
                                priority="secondary"
                                size="small"
                                onClick={() => {
                                    advance.reset();
                                    void integrationQuery.refetch();
                                }}
                            >
                                {tCommon("retry")}
                            </Button>
                        </>
                    }
                    small
                />
            )}

            <DatasheetUploadIntegrationView
                datastoreId={datastoreId}
                datasheetName={datasheetName}
                steps={steps}
                failed={failed}
                processingLaunched={processingLaunched}
                vectorDbId={integration?.vectordb_id ?? undefined}
                onDatasheetViewClick={
                    (successful || processingLaunched || failed) && integrationDatasheetName !== undefined
                        ? () => {
                              void queryClient.refetchQueries({ queryKey: RQKeys.datastore_datasheet(datastoreId, integrationDatasheetName) });
                              void goToDatasheet(integrationDatasheetName);
                          }
                        : undefined
                }
            />
        </div>
    );
};

export default DatasheetUploadIntegrationDialog;

import { fr } from "@codegouvfr/react-dsfr";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { useQuery } from "@tanstack/react-query";
import { type ComponentProps, Fragment, type ReactNode, useState } from "react";
import { tss } from "tss-react";

import { type DataDetailsProcessingExecution, type DataDetailsUpload } from "@/@types/app";
import api from "@/entrepot/api";
import { useTranslation } from "@/i18n";
import RQKeys from "@/modules/entrepot/RQKeys";
import { type ApiError } from "@/modules/jsonFetch";
import { niceBytes } from "@/utils";
import { delta } from "@/utils/delta";
import ReportStatusBadge from "./ReportStatusBadge";
import UploadFileTree from "./UploadFileTree";

// vérification ou traitement terminé : son journal ne bougera plus
const FINAL_STEP_STATUSES = new Set<string>(["SUCCESS", "FAILURE", "ABORTED"]);

type ReportStepsProps = {
    datastoreId: string;
    upload: DataDetailsUpload | null;
    /** absent sur la page d’une livraison, qui n’a pas de traitement */
    processing?: { storedDataId: string; executions: DataDetailsProcessingExecution[] };
};

export default function ReportSteps({ datastoreId, upload, processing }: ReportStepsProps) {
    const { t } = useTranslation("DataDetails");
    const { classes } = useStyles();
    const firstProcessingStep = upload ? 3 : 1;

    return (
        <>
            {(!upload || processing?.executions.length === 0) && (
                <Alert
                    severity="info"
                    small
                    className={fr.cx("fr-mb-2w")}
                    description={
                        <>
                            {!upload && <p className={fr.cx("fr-mb-0")}>{t("report.no_upload")}</p>}
                            {processing?.executions.length === 0 && <p className={fr.cx("fr-mb-0")}>{t("report.no_processing")}</p>}
                        </>
                    }
                />
            )}

            {upload && (
                <>
                    <Accordion titleAs="h4" label={t("step.upload", { number: 1 })}>
                        <dl className={fr.cx("fr-m-0", "fr-p-0")}>
                            {(
                                [
                                    [t("step.name"), upload.name],
                                    [t("field.id"), upload._id],
                                    [t("field.srs"), upload.srs],
                                    [t("report.status"), <ReportStatusBadge key="status" status={upload.status} />],
                                    [t("field.size"), upload.size ? niceBytes(String(upload.size)) : t("not_provided")],
                                ] satisfies [string, ReactNode][]
                            ).map(([label, value]) => (
                                <Fragment key={label}>
                                    <dt className={fr.cx("fr-text--sm", "fr-mb-0")}>{label}</dt>
                                    <dd className={classes.value}>{value}</dd>
                                </Fragment>
                            ))}
                        </dl>
                        <h5 className={fr.cx("fr-text--md", "fr-text--bold", "fr-mb-1w")}>{t("step.files")}</h5>
                        <UploadFileTree fileTree={upload.file_tree} />
                    </Accordion>

                    <Accordion titleAs="h4" label={t("step.checks", { number: 2 })}>
                        {upload.checks.map((check) => (
                            <LogStep
                                key={check._id}
                                titleAs="h5"
                                label={check.name ?? check._id}
                                status={check.status}
                                queryKey={RQKeys.datastore_upload_check_logs(datastoreId, upload._id, check._id)}
                                queryFn={(signal) => api.upload.getCheckLogs(datastoreId, upload._id, check._id, { signal })}
                            >
                                <ExecutionIds executionId={check._id} />
                            </LogStep>
                        ))}
                    </Accordion>
                </>
            )}

            {processing?.executions.map((execution, index) => (
                <LogStep
                    key={execution._id}
                    titleAs="h4"
                    label={t("step.processing", { number: firstProcessingStep + index, name: execution.name ?? execution._id })}
                    status={execution.status}
                    queryKey={RQKeys.datastore_stored_data_processing_logs(datastoreId, processing.storedDataId, execution._id)}
                    queryFn={(signal) => api.storedData.getProcessingLogs(datastoreId, processing.storedDataId, execution._id, { signal })}
                >
                    <ExecutionIds executionId={execution._id} outputId={execution.output_id} />
                </LogStep>
            ))}
        </>
    );
}

function ExecutionIds({ executionId, outputId }: { executionId: string; outputId?: string | null }) {
    const { t } = useTranslation("DataDetails");
    const { classes } = useStyles();

    return (
        <dl className={fr.cx("fr-m-0", "fr-p-0")}>
            <dt className={fr.cx("fr-text--sm", "fr-mb-0")}>{t("step.execution_id")}</dt>
            <dd className={classes.value}>{executionId}</dd>
            {outputId && (
                <>
                    <dt className={fr.cx("fr-text--sm", "fr-mb-0")}>{t("step.output_id")}</dt>
                    <dd className={classes.value}>{outputId}</dd>
                </>
            )}
        </dl>
    );
}

type LogStepProps = {
    titleAs: "h4" | "h5";
    label: string;
    status: ComponentProps<typeof ReportStatusBadge>["status"];
    queryKey: string[];
    queryFn: (signal: AbortSignal) => Promise<string[]>;
    children: ReactNode;
};

/** étape fermée par défaut : son journal n’est lu qu’à l’ouverture, puis relu tant qu’elle tourne */
function LogStep({ titleAs, label, status, queryKey, queryFn, children }: LogStepProps) {
    const { t } = useTranslation("DataDetails");
    const { classes } = useStyles();
    const [expanded, setExpanded] = useState(false);
    const running = !FINAL_STEP_STATUSES.has(status);

    const logsQuery = useQuery<string[], ApiError>({
        queryKey,
        queryFn: ({ signal }) => queryFn(signal),
        enabled: expanded,
        refetchInterval: expanded && running ? delta.seconds(30) : false,
    });

    return (
        <Accordion
            titleAs={titleAs}
            label={
                <>
                    <span className={fr.cx("fr-mr-2w")}>{label}</span>
                    <ReportStatusBadge status={status} />
                </>
            }
            expanded={expanded}
            onExpandedChange={(value) => setExpanded(value)}
        >
            {children}
            <p className={fr.cx("fr-text--sm", "fr-text--bold", "fr-mb-1v")}>{t("logs.title")}</p>
            {logsQuery.isPending ? (
                <p>{t("logs.loading")}</p>
            ) : logsQuery.isError ? (
                <p>{t("logs.error")}</p>
            ) : logsQuery.data.length === 0 ? (
                <p>{t("logs.empty")}</p>
            ) : (
                <pre>
                    <code className={classes.logs}>{logsQuery.data.join("\n")}</code>
                </pre>
            )}
        </Accordion>
    );
}

const useStyles = tss.withName({ ReportSteps }).create({
    value: {
        marginLeft: 0,
        paddingLeft: 0,
        marginBottom: fr.spacing("2w"),
        overflowWrap: "anywhere",
    },
    logs: {
        whiteSpace: "pre-line",
    },
});

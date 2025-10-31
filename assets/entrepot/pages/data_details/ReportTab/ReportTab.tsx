import { fr } from "@codegouvfr/react-dsfr";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { UseQueryResult } from "@tanstack/react-query";
import { FC, useMemo } from "react";

import { CheckStatusEnum, ProcessingExecutionStatusEnum, type StoredDataReport, type UploadReport } from "../../../../@types/app";
import { CartesApiException } from "../../../../modules/jsonFetch";
import { niceBytes } from "../../../../utils";
import ProcessingExecutionReport from "./ProcessingExecutionReport";
import ReportStatusBadge from "./ReportStatusBadge";
import UploadCheckExecutionReport from "./UploadCheckExecutionReport";
import UploadFileTree from "./UploadFileTree";

type ReportTabProps = {
    datastoreName?: string;
    reportQuery: UseQueryResult<StoredDataReport | UploadReport, CartesApiException>;
};

const ReportTab: FC<ReportTabProps> = ({ datastoreName, reportQuery }) => {
    let step = 1;

    const noUpload: boolean = !reportQuery?.data?.input_upload;
    const noProcessingExecutions: boolean | undefined = useMemo(() => {
        if (reportQuery?.data && "processing_executions" in reportQuery.data) {
            return reportQuery?.data?.processing_executions?.length === 0;
        }
    }, [reportQuery.data]);

    return (
        reportQuery?.data && (
            <>
                {(noUpload === true || noProcessingExecutions === true) && (
                    <Alert
                        severity="info"
                        description={
                            <>
                                {noUpload === true && (
                                    <>
                                        {"Aucune livraison n'est associée à cette donnée."}
                                        <br />
                                    </>
                                )}
                                {noProcessingExecutions === true && "Aucune information sur les traitements de génération de cette donnée n'a été trouvée."}
                            </>
                        }
                        small
                        closable={false}
                    />
                )}

                {reportQuery?.data?.input_upload && (
                    <>
                        <Accordion titleAs="h2" label={`${step++}. Données déposées`} defaultExpanded={true}>
                            <ul className={fr.cx("fr-raw-list")}>
                                <li>
                                    <strong>Nom :</strong> {reportQuery.data?.input_upload?.name}
                                </li>
                                <li>
                                    <strong>Identifiant technique :</strong> {reportQuery.data?.input_upload?._id}
                                </li>
                                <li>
                                    <strong>Projection :</strong> {reportQuery.data?.input_upload?.srs}
                                </li>
                                <li>
                                    <strong>Statut :</strong> {reportQuery.data?.input_upload?.status}
                                </li>
                                <li>
                                    <strong>Taille :</strong>{" "}
                                    {reportQuery.data?.input_upload?.size && niceBytes(reportQuery.data?.input_upload?.size.toString())}
                                </li>
                            </ul>

                            <Accordion titleAs="h3" label={"Fichiers déposés"} defaultExpanded={true} className={fr.cx("fr-mt-2v")}>
                                <UploadFileTree fileTree={reportQuery?.data?.input_upload?.file_tree} />
                            </Accordion>
                        </Accordion>

                        <Accordion titleAs="h2" label={`${step++}. Vérifications`} defaultExpanded={true}>
                            {reportQuery?.data?.input_upload.checks.map((check) => (
                                <Accordion
                                    key={check._id}
                                    titleAs="h3"
                                    label={
                                        <>
                                            <p>{check.check.name}</p>
                                            <ReportStatusBadge status={check.status} className={fr.cx("fr-ml-2w")} />
                                        </>
                                    }
                                    defaultExpanded={check.status === CheckStatusEnum.FAILURE}
                                >
                                    <UploadCheckExecutionReport check={check} datastoreName={datastoreName} />
                                </Accordion>
                            ))}
                        </Accordion>
                    </>
                )}

                {"processing_executions" in reportQuery.data &&
                    reportQuery?.data?.processing_executions.map((procExec) => (
                        <Accordion
                            key={procExec._id}
                            titleAs="h3"
                            label={
                                <>
                                    <p>{`${step++}. Traitement : ${procExec.processing.name}`}</p>
                                    <ReportStatusBadge status={procExec.status} className={fr.cx("fr-ml-2w")} />
                                </>
                            }
                            defaultExpanded={[ProcessingExecutionStatusEnum.FAILURE, ProcessingExecutionStatusEnum.ABORTED].includes(procExec.status)}
                        >
                            <ProcessingExecutionReport datastoreName={datastoreName} processingExecution={procExec} />
                        </Accordion>
                    ))}
            </>
        )
    );
};

export default ReportTab;

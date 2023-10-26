import { fr } from "@codegouvfr/react-dsfr";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { useQuery } from "@tanstack/react-query";
import { FC } from "react";

import api from "../../../api";
import DatastoreLayout from "../../../components/Layout/DatastoreLayout";
import LoadingText from "../../../components/Utils/LoadingText";
import RQKeys from "../../../modules/RQKeys";
import { CartesApiException } from "../../../modules/jsonFetch";
import { StoredDataReport } from "../../../types/app";
import ProcessingExecutionReport from "./ProcessingExecutionReport";
import UploadCheckExecutionReport from "./UploadCheckExecutionReport";
import UploadFileTree from "./UploadFileTree";

type StoredDataReportProps = {
    datastoreId: string;
    storedDataId: string;
};

const StoredDataReport: FC<StoredDataReportProps> = ({ datastoreId, storedDataId }) => {
    const datastoreQuery = useQuery({
        queryKey: RQKeys.datastore(datastoreId),
        queryFn: ({ signal }) => api.datastore.get(datastoreId, { signal }),
        staleTime: 3600000,
    });

    const reportQuery = useQuery<StoredDataReport, CartesApiException>({
        queryKey: RQKeys.datastore_stored_data_report(datastoreId, storedDataId),
        queryFn: ({ signal }) => api.storedData.getReportData(datastoreId, storedDataId, { signal }),
        staleTime: 3600000,
    });

    const pageTitle = `Rapport de génération de donnée stockée ${reportQuery?.data?.stored_data?.name ?? ""}`;

    return (
        <DatastoreLayout datastoreId={datastoreId} documentTitle={pageTitle}>
            <h1>{pageTitle}</h1>

            {reportQuery.isLoading && <LoadingText as="h2" />}

            {reportQuery.isError && <Alert severity="error" closable title={reportQuery.error.message} />}

            {reportQuery?.data && (
                <>
                    <Accordion titleAs="h2" label="Données déposées" defaultExpanded={true}>
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
                                <strong>Taille :</strong> {reportQuery.data?.input_upload?.size} octets
                            </li>
                        </ul>

                        <Accordion titleAs="h3" label="Fichiers déposés" defaultExpanded={true} className={fr.cx("fr-mt-2v")}>
                            <UploadFileTree fileTree={reportQuery?.data?.input_upload?.file_tree} />
                        </Accordion>
                    </Accordion>

                    <Accordion titleAs="h2" label="Vérifications" defaultExpanded={true}>
                        {reportQuery?.data?.input_upload.checks.map((check) => (
                            <Accordion key={check._id} titleAs="h3" label={check.check.name} defaultExpanded={true}>
                                <UploadCheckExecutionReport check={check} datastoreName={datastoreQuery?.data?.name} />
                            </Accordion>
                        ))}
                    </Accordion>

                    <Accordion titleAs="h2" label="Traitements" defaultExpanded={true}>
                        {reportQuery?.data.processing_executions.map((procExec) => (
                            <Accordion key={procExec._id} titleAs="h3" label={procExec.processing.name} defaultExpanded={true}>
                                <ProcessingExecutionReport datastoreName={datastoreQuery?.data?.name} processingExecution={procExec} />
                            </Accordion>
                        ))}
                    </Accordion>
                </>
            )}
        </DatastoreLayout>
    );
};

export default StoredDataReport;

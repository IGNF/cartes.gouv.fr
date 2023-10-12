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
import Logs from "./Logs";
import UploadFileTree from "./UploadFileTree";

type StoredDataReportProps = {
    datastoreId: string;
    storedDataId: string;
};

const StoredDataReport: FC<StoredDataReportProps> = ({ datastoreId, storedDataId }) => {
    const datastoreQuery = useQuery({
        queryKey: RQKeys.datastore(datastoreId),
        queryFn: ({ signal }) => api.datastore.get(datastoreId, { signal }),
        staleTime: 120000,
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
                    <Accordion label="Données déposées" defaultExpanded={true}>
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

                        <Accordion label="Fichiers déposés" defaultExpanded={true} className={fr.cx("fr-mt-2v")}>
                            {/* TODO : mettre en forme */}
                            <UploadFileTree fileTree={reportQuery?.data?.input_upload?.file_tree} />
                            {/* reportQuery?.data?.input_upload?.file_tree */}
                            {/* <pre>
                                <code>{JSON.stringify(reportQuery?.data?.input_upload.file_tree, null, 2)}</code>
                            </pre> */}
                        </Accordion>
                    </Accordion>

                    <Accordion label="Vérifications" defaultExpanded={true}>
                        {reportQuery?.data?.input_upload.checks.map((check) => (
                            <Accordion key={check._id} label={check.check.name} defaultExpanded={true}>
                                <ul className={fr.cx("fr-raw-list")}>
                                    <li>
                                        <strong>{"Espace de travail :"}</strong> {datastoreQuery?.data?.name}
                                    </li>
                                    <li>
                                        <strong>{"Identifiant technique de l'exécution de vérification :"}</strong> {check._id}
                                    </li>
                                    <li>
                                        <Logs logs={check.logs} />
                                    </li>
                                </ul>
                            </Accordion>
                        ))}
                    </Accordion>

                    {/* <pre>
                        <code>{JSON.stringify(reportQuery?.data?.stored_data, null, 2)}</code>
                    </pre>

                    <pre>
                        <code>{JSON.stringify(reportQuery?.data?.proc_int_exec, null, 2)}</code>
                    </pre>

                    <pre>
                        <code>{JSON.stringify(reportQuery?.data?.proc_pyr_creat_exec, null, 2)}</code>
                    </pre> */}
                </>
            )}
        </DatastoreLayout>
    );
};

export default StoredDataReport;

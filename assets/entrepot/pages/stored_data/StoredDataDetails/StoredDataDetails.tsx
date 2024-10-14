import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import Tabs from "@codegouvfr/react-dsfr/Tabs";
import { useQuery } from "@tanstack/react-query";
import { FC, useEffect, useMemo, useState } from "react";

import { Datastore, StoredDataStatusEnum } from "../../../../@types/app";
import DatastoreLayout from "../../../../components/Layout/DatastoreLayout";
import LoadingIcon from "../../../../components/Utils/LoadingIcon";
import RQKeys from "../../../../modules/entrepot/RQKeys";
import { CartesApiException } from "../../../../modules/jsonFetch";
import { routes } from "../../../../router/router";
import api from "../../../api";
import PreviewTab from "./PreviewTab/PreviewTab";
import ReportTab from "./ReportTab/ReportTab";

type StoredDataDetailsProps = {
    datastoreId: string;
    storedDataId: string;
};
const StoredDataDetails: FC<StoredDataDetailsProps> = ({ datastoreId, storedDataId }) => {
    const [reportQueryEnabled, setReportQueryEnabled] = useState(true);

    const datastoreQuery = useQuery<Datastore, CartesApiException>({
        queryKey: RQKeys.datastore(datastoreId),
        queryFn: ({ signal }) => api.datastore.get(datastoreId, { signal }),
        staleTime: 3600000,
    });

    const reportQuery = useQuery<ReportTab, CartesApiException>({
        queryKey: RQKeys.datastore_stored_data_report(datastoreId, storedDataId),
        queryFn: ({ signal }) => api.storedData.getReportData(datastoreId, storedDataId, { signal }),
        refetchInterval: 30000,
        enabled: reportQueryEnabled,
    });

    useEffect(() => {
        if (
            reportQuery.data?.stored_data.status !== undefined &&
            [StoredDataStatusEnum.DELETED, StoredDataStatusEnum.GENERATED, StoredDataStatusEnum.UNSTABLE].includes(reportQuery.data?.stored_data.status)
        ) {
            setReportQueryEnabled(false);
        }
    }, [reportQuery.data?.stored_data.status]);

    const datasheetName = useMemo(() => reportQuery?.data?.stored_data?.tags?.datasheet_name, [reportQuery?.data?.stored_data?.tags?.datasheet_name]);

    return (
        <DatastoreLayout datastoreId={datastoreId} documentTitle={`Détails de donnée stockée ${reportQuery?.data?.stored_data?.name ?? ""}`}>
            <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                {datasheetName ? (
                    <Button
                        iconId="fr-icon-arrow-left-s-line"
                        priority="tertiary no outline"
                        linkProps={routes.datastore_datasheet_view({ datastoreId, datasheetName, activeTab: "dataset" }).link}
                        title="Retour à la fiche de donnée"
                        size="large"
                    />
                ) : (
                    <Button
                        iconId="fr-icon-arrow-left-s-line"
                        priority="tertiary no outline"
                        linkProps={routes.datasheet_list({ datastoreId }).link}
                        title="Retour à mes données"
                        size="large"
                    />
                )}
                <h1 className={fr.cx("fr-m-0")}>
                    {"Détails de donnée stockée"}
                    {reportQuery.isLoading && <LoadingIcon className={fr.cx("fr-ml-2v")} largeIcon={true} />}
                </h1>
            </div>
            {reportQuery?.data?.stored_data?.name && (
                <div className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-mb-4w")}>
                    <h2>{reportQuery?.data?.stored_data?.name}</h2>
                </div>
            )}

            <div className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-mb-4w")}>
                {reportQuery.isError && <Alert severity="error" closable title={reportQuery.error.message} onClose={reportQuery.refetch} />}
            </div>

            {reportQuery.data && (
                <div className={fr.cx("fr-grid-row")}>
                    <div className={fr.cx("fr-col")}>
                        <Tabs
                            tabs={[
                                {
                                    label: "Aperçu de la donnée",
                                    content: <PreviewTab datastoreId={datastoreId} reportQuery={reportQuery} />,
                                },
                                {
                                    label: "Rapport de génération",
                                    content: <ReportTab datastoreName={datastoreQuery.data?.name} reportQuery={reportQuery} />,
                                    isDefault: true,
                                },
                            ]}
                        />
                    </div>
                </div>
            )}
        </DatastoreLayout>
    );
};

export default StoredDataDetails;

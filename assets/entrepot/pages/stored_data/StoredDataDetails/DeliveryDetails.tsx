import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import Tabs from "@codegouvfr/react-dsfr/Tabs";
import { useQuery } from "@tanstack/react-query";
import { FC, useMemo } from "react";

import { DeliveryReport } from "../../../../@types/app";
import DatastoreLayout from "../../../../components/Layout/DatastoreLayout";
import LoadingIcon from "../../../../components/Utils/LoadingIcon";
import RQKeys from "../../../../modules/entrepot/RQKeys";
import { CartesApiException } from "../../../../modules/jsonFetch";
import { routes } from "../../../../router/router";
import api from "../../../api";
import DeliveryPreviewTab from "./PreviewTab/DeliveryPreviewTab";
import ReportTab from "./ReportTab/ReportTab";

type DeliveryDetailsProps = {
    datastoreId: string;
    uploadDataId: string;
};

const DeliveryDetails: FC<DeliveryDetailsProps> = ({ datastoreId, uploadDataId }) => {
    const datastoreQuery = useQuery({
        queryKey: RQKeys.datastore(datastoreId),
        queryFn: ({ signal }) => api.datastore.get(datastoreId, { signal }),
        staleTime: 3600000,
    });

    const reportQuery = useQuery<DeliveryReport, CartesApiException>({
        queryKey: RQKeys.datastore_delivery_report(datastoreId, uploadDataId),
        queryFn: ({ signal }) => api.upload.getDeliveryReport(datastoreId, uploadDataId, { signal }),
        staleTime: 3600000,
    });

    const datasheetName = useMemo(() => reportQuery?.data?.input_upload?.tags?.datasheet_name, [reportQuery?.data?.input_upload?.tags?.datasheet_name]);

    return (
        <DatastoreLayout datastoreId={datastoreId} documentTitle={`Rapport de livraison ${reportQuery?.data?.input_upload?.name ?? ""}`}>
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
                    {"Rapport de livraison"}
                    {reportQuery.isLoading && <LoadingIcon className={fr.cx("fr-ml-2v")} largeIcon={true} />}
                </h1>
            </div>
            {reportQuery?.data?.input_upload?.name && (
                <div className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-mb-4w")}>
                    <h2>{reportQuery?.data?.input_upload?.name}</h2>
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
                                    content: <DeliveryPreviewTab reportData={reportQuery.data} />,
                                },
                                {
                                    label: "Rapport de génération",
                                    content: <ReportTab datastoreName={datastoreQuery.data?.name} reportQuery={reportQuery} />,
                                },
                            ]}
                        />
                    </div>
                </div>
            )}
        </DatastoreLayout>
    );
};

export default DeliveryDetails;

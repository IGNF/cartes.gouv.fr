import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import Tabs from "@codegouvfr/react-dsfr/Tabs";
import { useQuery } from "@tanstack/react-query";
import { FC, useMemo } from "react";

import { UploadReport } from "../../../@types/app";
import LoadingIcon from "../../../components/Utils/LoadingIcon";
import RQKeys from "../../../modules/entrepot/RQKeys";
import { CartesApiException } from "../../../modules/jsonFetch";
import { routes } from "../../../router/router";
import api from "../../api";
import UploadPreviewTab from "./PreviewTab/UploadPreviewTab";
import ReportTab from "./ReportTab/ReportTab";
import { useDatastore } from "../../../contexts/datastore";
import Main from "../../../components/Layout/Main";

type UploadDetailsProps = {
    datastoreId: string;
    uploadId: string;
};

const UploadDetails: FC<UploadDetailsProps> = ({ datastoreId, uploadId }) => {
    const { datastore } = useDatastore();

    const reportQuery = useQuery<UploadReport, CartesApiException>({
        queryKey: RQKeys.datastore_upload_report(datastoreId, uploadId),
        queryFn: ({ signal }) => api.upload.getUploadReport(datastoreId, uploadId, { signal }),
    });

    const datasheetName = useMemo(() => reportQuery?.data?.input_upload?.tags?.datasheet_name, [reportQuery?.data?.input_upload?.tags?.datasheet_name]);

    return (
        <Main title={`Rapport de livraison ${reportQuery?.data?.input_upload?.name ?? ""}`}>
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
                                    content: <UploadPreviewTab reportData={reportQuery.data} />,
                                },
                                {
                                    label: "Rapport de livraison",
                                    content: <ReportTab datastoreName={datastore?.name} reportQuery={reportQuery} />,
                                },
                            ]}
                        />
                    </div>
                </div>
            )}
        </Main>
    );
};

export default UploadDetails;

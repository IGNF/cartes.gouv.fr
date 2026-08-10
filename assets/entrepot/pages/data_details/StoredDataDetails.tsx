import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import Tabs from "@codegouvfr/react-dsfr/Tabs";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { FC, useEffect, useMemo, useState } from "react";

import { datastoreSuspenseQueryOptions } from "@/entrepot/hooks/queries/datastoreQueryOptions";
import { StoredDataReport, StoredDataStatusEnum } from "../../../@types/app";
import LoadingIcon from "../../../components/Utils/LoadingIcon";
import RQKeys from "@/entrepot/modules/RQKeys";
import { CartesApiException } from "../../../modules/jsonFetch";
import api from "../../api";
import StoredDataPreviewTab from "./PreviewTab/StoredDataPreviewTab";
import ReportTab from "./ReportTab/ReportTab";
import Main from "../../../components/Layout/Main";

type StoredDataDetailsProps = {
    datastoreId: string;
    storedDataId: string;
};
const StoredDataDetails: FC<StoredDataDetailsProps> = ({ datastoreId, storedDataId }) => {
    const [reportQueryEnabled, setReportQueryEnabled] = useState(true);
    const { data: datastore } = useSuspenseQuery(datastoreSuspenseQueryOptions(datastoreId));

    const reportQuery = useQuery<StoredDataReport, CartesApiException>({
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
        <Main title={`Détails de donnée stockée ${reportQuery?.data?.stored_data?.name ?? ""}`}>
            <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                {datasheetName ? (
                    <Button
                        iconId="fr-icon-arrow-left-s-line"
                        priority="tertiary no outline"
                        linkProps={{
                            to: "/tableau-de-bord/entrepots/$datastoreId/donnees/$datasheetName",
                            params: { datastoreId, datasheetName },
                            search: { activeTab: "dataset" },
                        }}
                        title="Retour à la fiche de donnée"
                        size="large"
                    />
                ) : (
                    <Button
                        iconId="fr-icon-arrow-left-s-line"
                        priority="tertiary no outline"
                        linkProps={{ to: "/tableau-de-bord/entrepots/$datastoreId/donnees", params: { datastoreId } }}
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
                                    content: <StoredDataPreviewTab datastoreId={datastoreId} reportQuery={reportQuery} />,
                                },
                                {
                                    label: "Rapport de génération",
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

export default StoredDataDetails;

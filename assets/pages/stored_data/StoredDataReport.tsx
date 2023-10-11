import { FC } from "react";

import DatastoreLayout from "../../components/Layout/DatastoreLayout";
import { useQuery } from "@tanstack/react-query";
import RQKeys from "../../modules/RQKeys";
import api from "../../api";
import LoadingText from "../../components/Utils/LoadingText";

type StoredDataReportProps = {
    datastoreId: string;
    storedDataId: string;
};
const StoredDataReport: FC<StoredDataReportProps> = ({ datastoreId, storedDataId }) => {
    const reportQuery = useQuery({
        queryKey: RQKeys.datastore_stored_data_report(datastoreId, storedDataId),
        queryFn: () => api.storedData.getReportData(datastoreId, storedDataId),
        staleTime: 3600000,
    });

    const title = `Rapport de génération de donnée stockée ${reportQuery?.data?.stored_data?.name}`;

    return (
        <DatastoreLayout datastoreId={datastoreId} documentTitle={title}>
            <h1>{title}</h1>

            {reportQuery.isLoading && <LoadingText as="h2" />}
        </DatastoreLayout>
    );
};

export default StoredDataReport;

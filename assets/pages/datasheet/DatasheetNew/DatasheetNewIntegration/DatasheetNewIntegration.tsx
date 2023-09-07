import { FC } from "react";

import DatastoreLayout from "../../../../components/Layout/DatastoreLayout";
import DatasheetNewIntegrationDialog from "./DatasheetNewIntegrationDialog";

type DatasheetNewIntegrationProps = {
    datastoreId: string;
    uploadId: string;
};
const DatasheetNewIntegration: FC<DatasheetNewIntegrationProps> = ({ datastoreId, uploadId }) => {
    return (
        <DatastoreLayout datastoreId={datastoreId} documentTitle="Intégration de votre donnée en base">
            <DatasheetNewIntegrationDialog datastoreId={datastoreId} uploadId={uploadId} />
        </DatastoreLayout>
    );
};

export default DatasheetNewIntegration;

import { FC } from "react";

import AppLayout from "../../../../components/Layout/AppLayout";
import DatasheetNewIntegrationDialog from "./DatasheetNewIntegrationDialog";

type DatasheetNewIntegrationProps = {
    datastoreId: string;
    uploadId: string;
};
const DatasheetNewIntegration: FC<DatasheetNewIntegrationProps> = ({ datastoreId, uploadId }) => {
    return (
        <AppLayout>
            <DatasheetNewIntegrationDialog datastoreId={datastoreId} uploadId={uploadId} />
        </AppLayout>
    );
};

export default DatasheetNewIntegration;

import { fr } from "@codegouvfr/react-dsfr";
import { FC } from "react";

import DatastoreLayout from "../../../../components/Layout/DatastoreLayout";
import DatasheetUploadIntegrationDialog from "./DatasheetUploadIntegrationDialog";

type DatasheetUploadIntegrationPageProps = {
    datastoreId: string;
    uploadId: string;
};
const DatasheetUploadIntegrationPage: FC<DatasheetUploadIntegrationPageProps> = ({ datastoreId, uploadId }) => {
    return (
        <DatastoreLayout datastoreId={datastoreId} documentTitle="Intégration des données">
            <div className={fr.cx("fr-grid-row")}>
                <h1>Intégration des données</h1>
            </div>
            <div className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-grid-row--center", "fr-mt-2v")}>
                <DatasheetUploadIntegrationDialog datastoreId={datastoreId} uploadId={uploadId} />
            </div>
        </DatastoreLayout>
    );
};

export default DatasheetUploadIntegrationPage;

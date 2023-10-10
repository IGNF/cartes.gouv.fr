import { fr } from "@codegouvfr/react-dsfr";
import { FC } from "react";

import DatastoreLayout from "../../../../components/Layout/DatastoreLayout";
import DatasheetNewIntegrationDialog from "./DatasheetNewIntegrationDialog";

type DatasheetNewIntegrationProps = {
    datastoreId: string;
    uploadId: string;
};
const DatasheetNewIntegration: FC<DatasheetNewIntegrationProps> = ({ datastoreId, uploadId }) => {
    return (
        <DatastoreLayout datastoreId={datastoreId} documentTitle="Intégration des données">
            <div className={fr.cx("fr-grid-row")}>
                <h1>Intégration des données</h1>
            </div>
            <div className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-grid-row--center", "fr-mt-2v")}>
                <DatasheetNewIntegrationDialog datastoreId={datastoreId} uploadId={uploadId} />
            </div>
        </DatastoreLayout>
    );
};

export default DatasheetNewIntegration;

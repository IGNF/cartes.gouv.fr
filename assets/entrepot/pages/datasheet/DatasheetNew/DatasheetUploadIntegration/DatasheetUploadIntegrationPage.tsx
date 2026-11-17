import { fr } from "@codegouvfr/react-dsfr";
import { FC } from "react";

import { useTranslation } from "../../../../../i18n";
import DatasheetUploadIntegrationDialog from "./DatasheetUploadIntegrationDialog";
import Main from "../../../../../components/Layout/Main";

type DatasheetUploadIntegrationPageProps = {
    datastoreId: string;
    uploadId: string;
    datasheetName: string | undefined;
};
const DatasheetUploadIntegrationPage: FC<DatasheetUploadIntegrationPageProps> = ({ datastoreId, uploadId, datasheetName }) => {
    const { t } = useTranslation("DatasheetUploadIntegration");

    return (
        <Main title={t("integration_page.title")}>
            <div className={fr.cx("fr-grid-row")}>
                <h1>{t("integration_page.title")}</h1>
            </div>
            <div className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-grid-row--center", "fr-mt-2v")}>
                <DatasheetUploadIntegrationDialog datastoreId={datastoreId} uploadId={uploadId} datasheetName={datasheetName} />
            </div>
        </Main>
    );
};

export default DatasheetUploadIntegrationPage;

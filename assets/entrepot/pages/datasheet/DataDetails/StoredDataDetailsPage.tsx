import Alert from "@codegouvfr/react-dsfr/Alert";
import { useQuery } from "@tanstack/react-query";
import { notFound } from "@tanstack/react-router";

import Main from "@/components/Layout/Main";
import StoredDataStatusBadge from "@/components/Utils/Badges/StoredDataStatusBadge";
import LoadingText from "@/components/Utils/LoadingText";
import { storedDataDetailsQueryOptions } from "@/hooks/queries/dataDetailsQueryOptions";
import { useTranslation } from "@/i18n";
import { getApiErrorMessage } from "@/modules/apiError";
import DataDetailsSheet from "./DataDetailsSheet";
import { storedDataDetailsData } from "./dataDetailsRows";
import ReportSteps from "./ReportSteps";

type StoredDataDetailsPageProps = {
    datastoreId: string;
    datasheetName: string;
    storedDataId: string;
};

export default function StoredDataDetailsPage({ datastoreId, datasheetName, storedDataId }: StoredDataDetailsPageProps) {
    const { t } = useTranslation("DataDetails");
    const detailsQuery = useQuery(storedDataDetailsQueryOptions(datastoreId, storedDataId));
    const details = detailsQuery.data;

    const renderContent = () => {
        if (detailsQuery.isPending) {
            return <LoadingText as="p" message={t("loading")} withSpinnerIcon />;
        }
        if (detailsQuery.isError && detailsQuery.error.status === 404) throw notFound();
        if (details === undefined) {
            return <Alert severity="error" title={t("load_error")} description={getApiErrorMessage(detailsQuery.error)} small />;
        }
        // donnée d’une autre fiche : elle n’apparaît pas sous celle de l’URL
        if (details.stored_data.tags.datasheet_name !== datasheetName) throw notFound();

        const { stored_data: storedData, source_vectordb: sourceVectorDb } = details;
        const data = storedDataDetailsData(storedData);

        return (
            <DataDetailsSheet
                details={data}
                statusBadge={<StoredDataStatusBadge status={storedData.status} />}
                extent={storedData.extent ?? sourceVectorDb?.extent}
                relations={data.kind === "vector_db" ? data.data.type_infos?.relations : sourceVectorDb?.relations}
                steps={
                    <ReportSteps datastoreId={datastoreId} upload={details.upload} processing={{ storedDataId, executions: details.processing_executions }} />
                }
            />
        );
    };

    return (
        <Main title={details ? `${details.stored_data.name} - ${datasheetName}` : datasheetName} breadcrumbSeparator>
            {renderContent()}
        </Main>
    );
}

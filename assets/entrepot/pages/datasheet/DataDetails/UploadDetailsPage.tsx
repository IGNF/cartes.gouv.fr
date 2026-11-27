import Alert from "@codegouvfr/react-dsfr/Alert";
import { useQuery } from "@tanstack/react-query";
import { notFound } from "@tanstack/react-router";

import Main from "@/components/Layout/Main";
import LoadingText from "@/components/Utils/LoadingText";
import { uploadDetailsQueryOptions } from "@/hooks/queries/dataDetailsQueryOptions";
import { useTranslation } from "@/i18n";
import { getApiErrorMessage } from "@/modules/apiError";
import DataDetailsSheet from "./DataDetailsSheet";
import ReportStatusBadge from "./ReportStatusBadge";
import ReportSteps from "./ReportSteps";

type UploadDetailsPageProps = {
    datastoreId: string;
    datasheetName: string;
    uploadId: string;
};

export default function UploadDetailsPage({ datastoreId, datasheetName, uploadId }: UploadDetailsPageProps) {
    const { t } = useTranslation("DataDetails");
    const uploadQuery = useQuery(uploadDetailsQueryOptions(datastoreId, uploadId));
    const upload = uploadQuery.data;

    const renderContent = () => {
        if (uploadQuery.isPending) {
            return <LoadingText as="p" message={t("loading")} withSpinnerIcon />;
        }
        if (uploadQuery.isError && uploadQuery.error.status === 404) throw notFound();
        if (upload === undefined) {
            return <Alert severity="error" title={t("load_error")} description={getApiErrorMessage(uploadQuery.error)} small />;
        }
        // livraison d’une autre fiche : elle n’apparaît pas sous celle de l’URL
        if (upload.tags.datasheet_name !== datasheetName) throw notFound();

        return (
            <DataDetailsSheet
                details={{ kind: "upload", data: upload }}
                statusBadge={<ReportStatusBadge status={upload.status} />}
                extent={upload.extent}
                relations={undefined}
                steps={<ReportSteps datastoreId={datastoreId} upload={upload} />}
            />
        );
    };

    return (
        <Main title={upload ? `${upload.name} - ${datasheetName}` : datasheetName} breadcrumbSeparator>
            {renderContent()}
        </Main>
    );
}

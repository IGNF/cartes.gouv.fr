import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import Tabs from "@codegouvfr/react-dsfr/Tabs";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { FC, useMemo } from "react";

import { datastoreSuspenseQueryOptions } from "@/entrepot/hooks/queries/datastoreQueryOptions";
import useDatastoreMembership from "@/entrepot/hooks/useDatastoreMembership";
import { datastoreLabel } from "@/entrepot/utils/datastoreLabel";
import { UploadReport } from "../../../@types/app";
import LoadingIcon from "../../../components/Utils/LoadingIcon";
import RQKeys from "@/entrepot/modules/RQKeys";
import { CartesApiException } from "../../../modules/jsonFetch";
import api from "../../api";
import UploadPreviewTab from "./PreviewTab/UploadPreviewTab";
import ReportTab from "./ReportTab/ReportTab";
import Main from "../../../components/Layout/Main";

type UploadDetailsProps = {
    datastoreId: string;
    uploadId: string;
};

const UploadDetails: FC<UploadDetailsProps> = ({ datastoreId, uploadId }) => {
    // conserve le blocage et le miroir-404 de la page ; le nom d'affichage vient de l'appartenance
    useSuspenseQuery(datastoreSuspenseQueryOptions(datastoreId));
    const membership = useDatastoreMembership();
    const datastoreName = datastoreLabel(membership?.community?.name, membership?.isSandbox);

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
                                    content: <ReportTab datastoreName={datastoreName} reportQuery={reportQuery} />,
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

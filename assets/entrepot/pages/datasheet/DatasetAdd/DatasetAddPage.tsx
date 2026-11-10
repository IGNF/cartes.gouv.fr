import { useQuery } from "@tanstack/react-query";

import { Metadata } from "@/@types/app";
import Main from "@/components/Layout/Main";
import LoadingText from "@/components/Utils/LoadingText";
import api from "@/entrepot/api";
import { useTranslation } from "@/i18n";
import RQKeys from "@/modules/entrepot/RQKeys";
import { type ApiError } from "@/modules/jsonFetch";
import { getMetadataCustodianName } from "@/utils";
import DatasetAddForm from "./DatasetAddForm";

type DatasetAddPageProps = {
    datastoreId: string;
    datasheetName: string;
};

/** formulaire « Ajouter une donnée » ; le producteur proposé est le gestionnaire lu dans la fiche de métadonnées */
export default function DatasetAddPage({ datastoreId, datasheetName }: DatasetAddPageProps) {
    const { t } = useTranslation("DatasetAdd");

    const metadataQuery = useQuery<Metadata, ApiError>({
        queryKey: RQKeys.datastore_datasheet_metadata(datastoreId, datasheetName),
        queryFn: ({ signal }) => api.metadata.getByDatasheetName(datastoreId, datasheetName, { signal }),
        staleTime: 60000,
        retry: false,
    });

    return (
        <Main title={`${t("title")} - ${datasheetName}`} breadcrumbSeparator="container">
            {/* sans fiche de métadonnées (404), pas de producteur proposé */}
            {metadataQuery.isPending ? (
                <LoadingText as="p" withSpinnerIcon />
            ) : (
                <DatasetAddForm datastoreId={datastoreId} datasheetName={datasheetName} defaultProducer={getMetadataCustodianName(metadataQuery.data) ?? ""} />
            )}
        </Main>
    );
}

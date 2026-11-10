import { useQuery } from "@tanstack/react-query";

import Main from "@/components/Layout/Main";
import LoadingText from "@/components/Utils/LoadingText";
import { useTranslation } from "@/i18n";
import { datasheetMetadataQueryOptions } from "@/hooks/queries/datasheetMetadataQueryOptions";
import { getMetadataCustodianName } from "@/utils";
import DatasetAddForm from "./DatasetAddForm";

type DatasetAddPageProps = {
    datastoreId: string;
    datasheetName: string;
};

/** formulaire « Ajouter une donnée » ; le producteur proposé est le gestionnaire lu dans la fiche de métadonnées */
export default function DatasetAddPage({ datastoreId, datasheetName }: DatasetAddPageProps) {
    const { t } = useTranslation("DatasetAdd");

    const metadataQuery = useQuery(datasheetMetadataQueryOptions(datastoreId, datasheetName));

    return (
        <Main title={`${t("title")} - ${datasheetName}`}>
            {/* sans fiche de métadonnées (404), pas de producteur proposé */}
            {metadataQuery.isPending ? (
                <LoadingText as="p" withSpinnerIcon />
            ) : (
                <DatasetAddForm datastoreId={datastoreId} datasheetName={datasheetName} defaultProducer={getMetadataCustodianName(metadataQuery.data) ?? ""} />
            )}
        </Main>
    );
}

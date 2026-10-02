import { useQuery } from "@tanstack/react-query";

import { Metadata } from "@/@types/app";
import Main from "@/components/Layout/Main";
import LoadingText from "@/components/Utils/LoadingText";
import api from "@/entrepot/api";
import RQKeys from "@/modules/entrepot/RQKeys";
import { CartesApiException } from "@/modules/jsonFetch";
import { getMetadataCustodianName } from "@/utils";
import DatasetAddForm from "./DatasetAddForm";

type DatasetAddPageProps = {
    datastoreId: string;
    datasheetName: string;
};

/** page d'ajout d'une donnée : charge les métadonnées de la fiche pour proposer le responsable (custodian) comme producteur par défaut */
export default function DatasetAddPage({ datastoreId, datasheetName }: DatasetAddPageProps) {
    const metadataQuery = useQuery<Metadata, CartesApiException>({
        queryKey: RQKeys.datastore_datasheet_metadata(datastoreId, datasheetName),
        queryFn: ({ signal }) => api.metadata.getByDatasheetName(datastoreId, datasheetName, { signal }),
        staleTime: 60000,
        retry: false,
    });

    if (metadataQuery.isLoading) {
        return (
            <Main title={`Ajouter une donnée — ${datasheetName}`}>
                <LoadingText as="h2" message="Chargement de la fiche de données ..." withSpinnerIcon />
            </Main>
        );
    }

    const defaultProducer = getMetadataCustodianName(metadataQuery.data) ?? "";

    return <DatasetAddForm datastoreId={datastoreId} datasheetName={datasheetName} defaultProducer={defaultProducer} />;
}

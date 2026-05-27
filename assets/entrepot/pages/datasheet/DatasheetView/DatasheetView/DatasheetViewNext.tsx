import Main from "@/components/Layout/Main";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { DatasheetDetailed, Metadata } from "@/@types/app";
import api from "@/entrepot/api";
import useCatalogueDatasheetUrl from "@/hooks/useCatalogueDatasheetUrl";
import RQKeys from "@/modules/entrepot/RQKeys";
import { CartesApiException } from "@/modules/jsonFetch";
import DatasheetHeader from "./DatasheetHeader";

export enum DatasheetViewActiveTabEnum {
    Description = "description",
    Dataset = "dataset",
    Annexes = "annexes",
    WMTSTMS = "wmts-tms",
    WFS = "wfs",
}

type DatasheetViewProps = {
    datastoreId: string;
    datasheetName: string;
    activeTab: string;
};

export default function DatasheetViewNext(props: DatasheetViewProps) {
    const {
        datastoreId,
        datasheetName,
        // activeTab = DatasheetViewActiveTabEnum.Description
    } = props;

    const datasheetQuery = useQuery<DatasheetDetailed, CartesApiException>({
        queryKey: RQKeys.datastore_datasheet(datastoreId, datasheetName),
        queryFn: ({ signal }) => api.datasheet.get(datastoreId, datasheetName, { signal }),
        staleTime: 60000,
        retry: false,
        // enabled: !datasheetDeleteMutation.isPending,
    });
    const datasheet = datasheetQuery.data;

    const metadataQuery = useQuery<Metadata, CartesApiException>({
        queryKey: RQKeys.datastore_datasheet_metadata(datastoreId, datasheetName),
        queryFn: ({ signal }) => api.metadata.getByDatasheetName(datastoreId, datasheetName, { signal }),
        // enabled: !datasheetDeleteMutation.isPending,
        staleTime: 60000,
        retry: false,
    });
    const metadata = metadataQuery.data;

    const { catalogueDatasheetUrl } = useCatalogueDatasheetUrl(datastoreId, datasheetName);

    const isPublished = useMemo(() => metadata?.endpoints?.length !== undefined && metadata?.endpoints?.length > 0, [metadata?.endpoints?.length]);

    return (
        <Main title={`Données ${datasheetName}`}>
            <DatasheetHeader
                name={datasheetName}
                thumbnailUrl={datasheet?.thumbnail?.url}
                catalogLink={catalogueDatasheetUrl}
                published={isPublished}
                loading={datasheetQuery.isLoading}
            />
        </Main>
    );
}

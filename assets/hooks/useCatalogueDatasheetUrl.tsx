import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { Metadata } from "@/@types/app";
import { useDatastore } from "@/contexts/datastore";
import api from "@/entrepot/api";
import { catalogueUrl } from "@/env";
import RQKeys from "@/modules/entrepot/RQKeys";
import { CartesApiException } from "@/modules/jsonFetch";

export default function useCatalogueDatasheetUrl(datastoreId: string, datasheetName: string) {
    const { datastore } = useDatastore();

    const metadataQuery = useQuery<Metadata, CartesApiException>({
        queryKey: RQKeys.datastore_datasheet_metadata(datastoreId, datasheetName),
        queryFn: ({ signal }) => api.metadata.getByDatasheetName(datastoreId, datasheetName, { signal }),
        // enabled: !datasheetDeleteMutation.isPending,
        staleTime: 60000,
        retry: false,
    });
    const metadata = metadataQuery.data;

    const catalogueDatasheetUrl = useMemo(() => {
        // si datastore sandbox
        if (datastore?.is_sandbox === true) {
            const metadataEndpoint = datastore?.endpoints?.find((ep) => ep.endpoint._id === metadata?.endpoints?.[0]?._id);
            const cswBaseUrl = metadataEndpoint?.endpoint.urls?.[0].url.trim();

            if (cswBaseUrl !== undefined) {
                return `${cswBaseUrl}?REQUEST=GetRecordById&SERVICE=CSW&VERSION=2.0.2&OUTPUTSCHEMA=http://www.isotc211.org/2005/gmd&elementSetName=full&ID=${metadata?.file_identifier}`;
            }
            return;
        }

        return `${catalogueUrl}/dataset/${metadata?.file_identifier}`;
    }, [metadata?.file_identifier, datastore?.is_sandbox, datastore?.endpoints, metadata?.endpoints]);

    return { catalogueDatasheetUrl };
}

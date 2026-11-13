import { useQuery } from "@tanstack/react-query";

import { Metadata } from "@/@types/app";
import { catalogueUrl } from "@/env";
import { datastoreQueryOptions } from "@/hooks/queries/datastoreQueryOptions";
import useMembership from "@/hooks/useMembership";

/** lien vers la fiche de métadonnées dans le catalogue ; bac à sable : GetRecordById sur le CSW du point d’accès de publication */
export default function useCatalogueDatasheetUrl(datastoreId: string, metadata: Metadata | undefined): string | undefined {
    const isSandbox = useMembership({ datastoreId })?.isSandbox === true;
    const { data: datastore } = useQuery({ ...datastoreQueryOptions(datastoreId), enabled: isSandbox });

    if (metadata === undefined) {
        return undefined;
    }

    if (!isSandbox) {
        return `${catalogueUrl}/dataset/${metadata.file_identifier}`;
    }

    const cswBaseUrl = datastore?.endpoints?.find((ep) => ep.endpoint._id === metadata.endpoints?.[0]?._id)?.endpoint.urls?.[0]?.url.trim();
    return cswBaseUrl === undefined
        ? undefined
        : `${cswBaseUrl}?REQUEST=GetRecordById&SERVICE=CSW&VERSION=2.0.2&OUTPUTSCHEMA=http://www.isotc211.org/2005/gmd&elementSetName=full&ID=${metadata.file_identifier}`;
}

import { queryOptions } from "@tanstack/react-query";

import { type DatasheetDocument } from "@/@types/app";
import api from "@/entrepot/api";
import RQKeys from "@/modules/entrepot/RQKeys";
import { type ApiError } from "@/modules/jsonFetch";

/** documents d’une fiche (onglet Annexes) */
export function datasheetDocumentsQueryOptions(datastoreId: string, datasheetName: string) {
    return queryOptions<DatasheetDocument[], ApiError>({
        queryKey: RQKeys.datastore_datasheet_documents_list(datastoreId, datasheetName),
        queryFn: ({ signal }) => api.datasheetDocument.getList(datastoreId, datasheetName, { signal }),
        staleTime: 120000,
    });
}

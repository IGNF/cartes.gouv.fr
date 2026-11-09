import { queryOptions } from "@tanstack/react-query";

import api from "@/entrepot/api";
import RQKeys from "@/modules/entrepot/RQKeys";
import { delta } from "@/utils/delta";

// contenu principal de la page : une erreur va à la page d’erreur du layout entrepôt
export function datasheetListQueryOptions(datastoreId: string) {
    return queryOptions({
        queryKey: RQKeys.datastore_datasheet_list(datastoreId),
        queryFn: ({ signal }) => api.datasheet.getList(datastoreId, { signal }),
        staleTime: delta.minutes(1),
        throwOnError: true,
    });
}

import { queryOptions } from "@tanstack/react-query";

import { DatastoreEndpoint } from "@/@types/app";
import api from "@/entrepot/api";
import RQKeys from "@/modules/entrepot/RQKeys";
import { delta } from "@/utils/delta";

// 0,1 s contre 12 s pour le DTO entrepôt complet
export function datastoreEndpointsQueryOptions(datastoreId: string) {
    return queryOptions<DatastoreEndpoint[]>({
        queryKey: RQKeys.datastore_endpoints(datastoreId),
        queryFn: ({ signal }) => api.datastore.getEndpoints(datastoreId, {}, { signal }),
        staleTime: delta.hours(1),
    });
}

import { queryOptions } from "@tanstack/react-query";

import { DatastoreEndpoint } from "@/@types/app";
import api from "@/entrepot/api";
import RQKeys from "@/modules/entrepot/RQKeys";

// bien plus rapide que le DTO entrepôt complet
export function datastoreEndpointsQueryOptions(datastoreId: string) {
    return queryOptions<DatastoreEndpoint[]>({
        queryKey: RQKeys.datastore_endpoints(datastoreId),
        queryFn: ({ signal }) => api.datastore.getEndpoints(datastoreId, {}, { signal }),
    });
}

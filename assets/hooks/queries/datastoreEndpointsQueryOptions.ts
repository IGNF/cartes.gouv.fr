import { queryOptions, type UseQueryResult } from "@tanstack/react-query";

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

/** lecture des quotas avant publication : échec immédiat, même hors ligne, plutôt que des relances ; à lire avec `freshEndpoints` */
export function quotaEndpointsQueryOptions(datastoreId: string) {
    return queryOptions({ ...datastoreEndpointsQueryOptions(datastoreId), retry: false, networkMode: "always", refetchOnReconnect: true });
}

/** endpoints relus avec succès depuis le montage : la copie persistée (localStorage) peut dater de 24 h */
export const freshEndpoints = (query: UseQueryResult<DatastoreEndpoint[]>): DatastoreEndpoint[] | undefined =>
    query.isSuccess && query.isFetchedAfterMount ? query.data : undefined;

import { queryOptions } from "@tanstack/react-query";

import type { DatastorePermission } from "@/@types/app";
import api from "@/entrepot/api";
import RQKeys from "@/modules/entrepot/RQKeys";
import { type ApiError } from "@/modules/jsonFetch";
import { delta } from "@/utils/delta";

export function datastorePermissionsQueryOptions(datastoreId: string) {
    return queryOptions<DatastorePermission[], ApiError>({
        queryKey: RQKeys.datastore_permissions(datastoreId),
        queryFn: ({ signal }) => api.datastore.getPermissions(datastoreId, {}, { signal }),
        staleTime: delta.minutes(1),
        retry: false,
    });
}

import { queryOptions } from "@tanstack/react-query";

import type { Service } from "@/@types/app";
import api from "@/entrepot/api";
import RQKeys from "@/modules/entrepot/RQKeys";
import { type ApiError } from "@/modules/jsonFetch";
import { delta } from "@/utils/delta";

export function datasheetServiceListQueryOptions(datastoreId: string, datasheetName: string) {
    return queryOptions<Service[], ApiError>({
        queryKey: RQKeys.datastore_datasheet_service_list(datastoreId, datasheetName),
        queryFn: ({ signal }) => api.datasheet.getServices(datastoreId, datasheetName, { signal }),
        staleTime: delta.minutes(1),
        retry: false,
    });
}

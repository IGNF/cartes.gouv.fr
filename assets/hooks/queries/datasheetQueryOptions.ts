import { queryOptions } from "@tanstack/react-query";

import type { DatasheetDetailed } from "@/@types/app";
import api from "@/entrepot/api";
import RQKeys from "@/modules/entrepot/RQKeys";
import { type ApiError } from "@/modules/jsonFetch";
import { delta } from "@/utils/delta";

export function datasheetQueryOptions(datastoreId: string, datasheetName: string) {
    return queryOptions<DatasheetDetailed, ApiError>({
        queryKey: RQKeys.datastore_datasheet(datastoreId, datasheetName),
        queryFn: ({ signal }) => api.datasheet.get(datastoreId, datasheetName, { signal }),
        staleTime: delta.minutes(1),
        retry: false,
    });
}

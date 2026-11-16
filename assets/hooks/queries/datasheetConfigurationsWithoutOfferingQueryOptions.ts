import { queryOptions } from "@tanstack/react-query";

import type { Configuration } from "@/@types/app";
import api from "@/entrepot/api";
import RQKeys from "@/modules/entrepot/RQKeys";
import { type ApiError } from "@/modules/jsonFetch";
import { delta } from "@/utils/delta";

export function datasheetConfigurationsWithoutOfferingQueryOptions(datastoreId: string, datasheetName: string) {
    return queryOptions<Configuration[], ApiError>({
        queryKey: RQKeys.datastore_datasheet_configurations_without_offering(datastoreId, datasheetName),
        queryFn: ({ signal }) => api.datasheet.getConfigurationsWithoutOffering(datastoreId, datasheetName, { signal }),
        staleTime: delta.minutes(1),
        retry: false,
    });
}

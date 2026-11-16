import { queryOptions } from "@tanstack/react-query";

import type { Service } from "@/@types/app";
import api from "@/entrepot/api";
import RQKeys from "@/modules/entrepot/RQKeys";
import { type ApiError } from "@/modules/jsonFetch";
import { delta } from "@/utils/delta";

export function serviceQueryOptions(datastoreId: string, offeringId: string) {
    return queryOptions<Service, ApiError>({
        queryKey: RQKeys.datastore_offering(datastoreId, offeringId),
        queryFn: ({ signal }) => api.service.getService(datastoreId, offeringId, { signal }),
        staleTime: delta.minutes(1),
    });
}

import { UndefinedInitialDataOptions, useQuery } from "@tanstack/react-query";

import { StoredData } from "@/@types/app";
import api from "@/entrepot/api";
import RQKeys from "@/modules/entrepot/RQKeys";
import { ApiError } from "@/modules/jsonFetch";
import { type QueryParams } from "@/modules/Routing";
import { delta } from "@/utils";

export default function useStoredDataListQuery(
    datastoreId: string,
    queryParams: QueryParams = {},
    otherOptions?: Partial<UndefinedInitialDataOptions<StoredData[], ApiError>>
) {
    return useQuery<StoredData[], ApiError>({
        queryKey: RQKeys.datastore_stored_data_list(datastoreId, queryParams),
        queryFn: ({ signal }) => api.storedData.getAll<StoredData[]>(datastoreId, queryParams, { signal }),
        staleTime: delta.minutes(5),
        ...otherOptions,
    });
}

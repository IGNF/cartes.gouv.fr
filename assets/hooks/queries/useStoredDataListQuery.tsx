import { UndefinedInitialDataOptions, useQuery } from "@tanstack/react-query";

import { StoredData } from "@/@types/app";
import api from "@/entrepot/api";
import RQKeys from "@/modules/entrepot/RQKeys";
import { CartesApiException } from "@/modules/jsonFetch";
import { delta } from "@/utils";

export default function useStoredDataListQuery(
    datastoreId: string,
    queryParams: object = {},
    otherOptions?: Partial<UndefinedInitialDataOptions<StoredData[], CartesApiException>>
) {
    return useQuery<StoredData[], CartesApiException>({
        queryKey: RQKeys.datastore_stored_data_list(datastoreId, queryParams),
        queryFn: ({ signal }) => api.storedData.getAll<StoredData[]>(datastoreId, queryParams, { signal }),
        staleTime: delta.minutes(5),
        ...otherOptions,
    });
}

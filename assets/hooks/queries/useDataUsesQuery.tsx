import { UndefinedInitialDataOptions, useQuery } from "@tanstack/react-query";

import api from "@/entrepot/api";
import RQKeys from "@/modules/entrepot/RQKeys";
import { delta } from "@/utils";

export default function useDataUsesQuery(
    datastoreId: string,
    storedDataId: string,
    otherOptions?: Partial<UndefinedInitialDataOptions<Awaited<ReturnType<typeof api.storedData.getUses>>>>
) {
    return useQuery({
        queryKey: RQKeys.datastore_stored_data_uses(datastoreId, storedDataId),
        queryFn: ({ signal }) => api.storedData.getUses(datastoreId, storedDataId, { signal }),
        staleTime: delta.minutes(10),
        ...otherOptions,
    });
}

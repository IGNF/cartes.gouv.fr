import { queryOptions, skipToken } from "@tanstack/react-query";

import { type VectorDb } from "@/@types/app";
import api from "@/entrepot/api";
import RQKeys from "@/modules/entrepot/RQKeys";
import { type ApiError } from "@/modules/jsonFetch";
import { delta } from "@/utils/delta";

// sans base choisie, la requête ne part pas et rien n’est mis en cache
export const vectorDbQueryOptions = (datastoreId: string, storedDataId: string) =>
    queryOptions<VectorDb, ApiError>({
        queryKey: RQKeys.datastore_stored_data(datastoreId, storedDataId),
        queryFn: storedDataId === "" ? skipToken : ({ signal }) => api.storedData.get<VectorDb>(datastoreId, storedDataId, { signal }),
        staleTime: delta.minutes(1),
    });

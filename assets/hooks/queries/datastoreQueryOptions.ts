import api from "@/entrepot/api";
import RQKeys from "@/modules/entrepot/RQKeys";
import { delta } from "@/utils/delta";

/** Options communes de la requête datastore ; désactivée tant que l'id est inconnu */
export function datastoreQueryOptions(datastoreId: string | undefined) {
    return {
        queryKey: RQKeys.datastore(datastoreId ?? ""),
        queryFn: ({ signal }: { signal: AbortSignal }) => api.datastore.get(datastoreId!, { signal }),
        staleTime: delta.hours(1),
        enabled: datastoreId !== undefined,
    };
}

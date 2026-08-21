import api from "@/entrepot/api";
import RQKeys from "@/entrepot/modules/RQKeys";

/** Options communes de la requête des annexes d'un entrepôt ; désactivée tant que l'id est inconnu */
export function datastoreAnnexeListQueryOptions(datastoreId: string | undefined) {
    return {
        queryKey: RQKeys.datastore_annexe_list(datastoreId ?? ""),
        queryFn: ({ signal }: { signal: AbortSignal }) => {
            // un refetch() manuel contourne enabled : ne jamais appeler l'API sans id
            if (datastoreId === undefined) return Promise.reject(new Error("datastoreId manquant"));
            return api.annexe.getAll(datastoreId, { signal });
        },
        enabled: datastoreId !== undefined,
    };
}

import { UseQueryOptions } from "@tanstack/react-query";

import { Datasheet } from "@/@types/app";
import api from "@/entrepot/api";
import RQKeys from "@/entrepot/modules/RQKeys";
import { CartesApiException } from "@/modules/jsonFetch";
import { delta } from "@/utils/delta";

/**
 * Options communes de la requête liste des fiches de données (requête principale de la page).
 * throwOnError : toute erreur (dont 404 miroir) remonte à l'errorComponent du layout datastore.
 */
export function datasheetListQueryOptions(datastoreId: string): UseQueryOptions<Datasheet[], CartesApiException> {
    return {
        queryKey: RQKeys.datastore_datasheet_list(datastoreId),
        queryFn: ({ signal }) => api.datasheet.getList(datastoreId, { signal }),
        staleTime: delta.minutes(1),
        throwOnError: true,
    };
}

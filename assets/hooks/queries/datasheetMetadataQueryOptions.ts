import { queryOptions } from "@tanstack/react-query";

import { type Metadata } from "@/@types/app";
import api from "@/entrepot/api";
import RQKeys from "@/modules/entrepot/RQKeys";
import { type ApiError } from "@/modules/jsonFetch";

/** fiche de métadonnées d’une fiche de données ; 404 si elle n’en a pas */
export function datasheetMetadataQueryOptions(datastoreId: string, datasheetName: string) {
    // une relecture sans donnée repasse la requête en attente et démonte les formulaires qui en dépendent :
    // après une erreur (404 ou autre), ni le focus de la fenêtre ni la reconnexion ne relancent la lecture
    const refetchUnlessError = (query: { state: { status: string } }) => query.state.status !== "error";

    return queryOptions<Metadata, ApiError>({
        queryKey: RQKeys.datastore_datasheet_metadata(datastoreId, datasheetName),
        queryFn: ({ signal }) => api.metadata.getByDatasheetName(datastoreId, datasheetName, { signal }),
        staleTime: 60000,
        retry: false,
        refetchOnWindowFocus: refetchUnlessError,
        refetchOnReconnect: refetchUnlessError,
    });
}

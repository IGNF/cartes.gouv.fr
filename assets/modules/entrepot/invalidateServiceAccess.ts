import type { QueryClient } from "@tanstack/react-query";

import RQKeys from "./RQKeys";

/** après un changement de permission : relit l’accès des flux, dans les listes de flux des fiches et dans chaque flux */
export function invalidateServiceAccess(queryClient: QueryClient, datastoreId: string) {
    void queryClient.invalidateQueries({
        predicate: ({ queryKey }) =>
            typeof queryKey[3] === "string" && JSON.stringify(queryKey) === JSON.stringify(RQKeys.datastore_datasheet_service_list(datastoreId, queryKey[3])),
    });
    void queryClient.invalidateQueries({ queryKey: RQKeys.datastore_services(datastoreId) });
}

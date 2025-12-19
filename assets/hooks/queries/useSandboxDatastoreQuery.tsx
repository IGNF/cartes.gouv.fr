import { useQuery } from "@tanstack/react-query";

import { Datastore } from "@/@types/app";
import api from "@/entrepot/api";
import RQKeys from "@/modules/entrepot/RQKeys";
import { CartesApiException } from "@/modules/jsonFetch";

export default function useSandboxDatastoreQuery() {
    const sandboxDatastoreQuery = useQuery<Datastore, CartesApiException>({
        queryKey: RQKeys.datastore("sandbox"),
        queryFn: ({ signal }) => api.datastore.getSandbox({ signal }),
        staleTime: 3600000,
    });
    return sandboxDatastoreQuery;
}

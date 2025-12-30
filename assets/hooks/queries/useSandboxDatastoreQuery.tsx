import { usePrefetchQuery, UsePrefetchQueryOptions, useQuery, UseQueryOptions } from "@tanstack/react-query";

import { Datastore } from "@/@types/app";
import api from "@/entrepot/api";
import RQKeys from "@/modules/entrepot/RQKeys";
import { CartesApiException } from "@/modules/jsonFetch";

const options = {
    queryKey: RQKeys.datastore("sandbox"),
    queryFn: ({ signal }) => api.datastore.getSandbox({ signal }),
    staleTime: 3600000,
};

export function useSandboxDatastoreQuery() {
    const sandboxDatastoreQuery = useQuery<Datastore, CartesApiException>(options satisfies UseQueryOptions<Datastore, CartesApiException>);
    return sandboxDatastoreQuery;
}

export function useSandboxDatastorePrefetchQuery() {
    return usePrefetchQuery<Datastore, CartesApiException>(options satisfies UsePrefetchQueryOptions<Datastore, CartesApiException>);
}

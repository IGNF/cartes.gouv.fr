import { useQuery, useQueryClient } from "@tanstack/react-query";

import RCKeys from "../modules/RCKeys";
import api from "../api";
import { useEffect } from "react";
import useUser from "./useUser";
import { Datastore } from "../types/app";
import { CartesApiException } from "../modules/jsonFetch";

export const useDatastoreList = () => {
    const abortController = new AbortController();
    const queryClient = useQueryClient();

    const { user } = useUser();

    useEffect(() => {
        return () => {
            queryClient.cancelQueries({
                queryKey: [...RCKeys.datastore_list],
            });
        };
    }, [queryClient]);

    return useQuery<Datastore[], CartesApiException>({
        queryKey: RCKeys.datastore_list,
        queryFn: () => api.user.getDatastoresList({ signal: abortController.signal }),
        staleTime: 60000,
        enabled: !!user,
    });
};

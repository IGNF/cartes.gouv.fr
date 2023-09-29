import { useQuery } from "@tanstack/react-query";

import api from "../api";
import RQKeys from "../modules/RQKeys";
import { CartesApiException } from "../modules/jsonFetch";
import { Datastore } from "../types/app";
import useUser from "./useUser";

export const useDatastoreList = () => {
    const { user } = useUser();

    return useQuery<Datastore[], CartesApiException>({
        queryKey: RQKeys.datastore_list(),
        queryFn: ({ signal }) => api.user.getDatastoresList({ signal }),
        staleTime: 300000,
        enabled: !!user,
    });
};

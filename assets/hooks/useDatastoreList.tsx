import { useQuery } from "@tanstack/react-query";

import api from "../entrepot/api";
import RQKeys from "../modules/entrepot/RQKeys";
import { CartesApiException } from "../modules/jsonFetch";
import { useAuthStore } from "../stores/AuthStore";
import { Datastore } from "../@types/app";

const useDatastoreList = () => {
    const user = useAuthStore((state) => state.user);

    return useQuery<Datastore[], CartesApiException>({
        queryKey: RQKeys.datastore_list(),
        queryFn: ({ signal }) => api.user.getDatastoresList({ signal }),
        staleTime: 300000,
        enabled: !!user,
    });
};

export default useDatastoreList;

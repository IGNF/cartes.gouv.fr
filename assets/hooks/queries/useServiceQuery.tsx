import { UndefinedInitialDataOptions, useQuery } from "@tanstack/react-query";

import { delta } from "@/utils";
import type { Service } from "../../@types/app";
import api from "../../entrepot/api";
import RQKeys from "../../modules/entrepot/RQKeys";
import { type CartesApiException } from "../../modules/jsonFetch";

export default function useServiceQuery(
    datastoreId: string,
    offeringId: string,
    otherOptions?: Partial<UndefinedInitialDataOptions<Service, CartesApiException>>
) {
    return useQuery<Service, CartesApiException>({
        queryKey: RQKeys.datastore_offering(datastoreId, offeringId),
        queryFn: ({ signal }) => api.service.getService(datastoreId, offeringId, { signal }),
        staleTime: delta.minutes(1),
        ...otherOptions,
    });
}

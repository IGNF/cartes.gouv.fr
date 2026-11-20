import { UndefinedInitialDataOptions, useQuery } from "@tanstack/react-query";

import type { Service } from "@/@types/app";
import { type ApiError } from "@/modules/jsonFetch";
import { serviceQueryOptions } from "./serviceQueryOptions";

export default function useServiceQuery(datastoreId: string, offeringId: string, otherOptions?: Partial<UndefinedInitialDataOptions<Service, ApiError>>) {
    return useQuery<Service, ApiError>({ ...serviceQueryOptions(datastoreId, offeringId), ...otherOptions });
}

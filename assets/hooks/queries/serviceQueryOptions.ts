import { queryOptions } from "@tanstack/react-query";

import { OfferingTypeEnum, type Service, StoredDataTypeEnum, type TmsMetadata } from "@/@types/app";
import api from "@/entrepot/api";
import RQKeys from "@/modules/entrepot/RQKeys";
import { type ApiError } from "@/modules/jsonFetch";
import { delta } from "@/utils/delta";

const TMS_METADATA_TIMEOUT_MS = 5000;

/** métadonnées d’un TMS ouvert, lues par le navigateur ; un échec ou un délai dépassé laisse le flux sans elles */
export async function readTmsMetadata(service: Service, signal: AbortSignal): Promise<TmsMetadata | undefined> {
    const tmsUrl = service.urls?.find((url) => url.type === "TMS")?.url;
    if (!service.open || service.type !== OfferingTypeEnum.WMTSTMS || service.configuration.pyramid?.type !== StoredDataTypeEnum.ROK4PYRAMIDVECTOR || !tmsUrl) {
        return undefined;
    }
    try {
        const response = await fetch(`${tmsUrl}/metadata.json`, { signal: AbortSignal.any([signal, AbortSignal.timeout(TMS_METADATA_TIMEOUT_MS)]) });
        return response.ok ? ((await response.json()) as TmsMetadata) : undefined;
    } catch {
        return undefined;
    }
}

export function serviceQueryOptions(datastoreId: string, offeringId: string) {
    return queryOptions<Service, ApiError>({
        queryKey: RQKeys.datastore_service(datastoreId, offeringId),
        queryFn: async ({ signal }) => {
            const service = await api.service.getService(datastoreId, offeringId, { signal });
            const tmsMetadata = await readTmsMetadata(service, signal);
            return tmsMetadata ? { ...service, tms_metadata: tmsMetadata } : service;
        },
        staleTime: delta.minutes(1),
    });
}

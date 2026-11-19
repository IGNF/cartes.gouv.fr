import { queryOptions, replaceEqualDeep } from "@tanstack/react-query";

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

/** relecture sans accès (permissions non lues) ou sans métadonnées TMS : celles déjà lues sont gardées, le formulaire ne se verrouille pas en cours de saisie */
export function keepKnownServiceFields(previous: unknown, next: Service): Service {
    const known = previous as Service | undefined;
    if (known?._id !== next._id) {
        return next;
    }
    return replaceEqualDeep(known, { ...next, access: next.access ?? known.access, tms_metadata: next.tms_metadata ?? known.tms_metadata });
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
        structuralSharing: (previous, next) => keepKnownServiceFields(previous, next as Service),
    });
}

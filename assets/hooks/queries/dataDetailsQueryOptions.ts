import { queryOptions } from "@tanstack/react-query";

import { type DataDetailsUpload, type StoredDataDetails } from "@/@types/app";
import api from "@/entrepot/api";
import RQKeys from "@/modules/entrepot/RQKeys";
import { type ApiError } from "@/modules/jsonFetch";
import { delta } from "@/utils/delta";

const FINAL_STORED_DATA_STATUSES = new Set<string>(["GENERATED", "UNSTABLE", "DELETED"]);
// une livraison OPEN ne change que sur action de l’utilisateur
const RUNNING_UPLOAD_STATUSES = new Set<string>(["CREATED", "CHECKING", "GENERATING", "MODIFYING"]);

export const storedDataRefetchInterval = (details: StoredDataDetails | undefined) =>
    details !== undefined && !FINAL_STORED_DATA_STATUSES.has(details.stored_data.status) ? delta.seconds(30) : false;

export const uploadRefetchInterval = (upload: DataDetailsUpload | undefined) =>
    upload !== undefined && RUNNING_UPLOAD_STATUSES.has(upload.status) ? delta.seconds(30) : false;

export const storedDataDetailsQueryOptions = (datastoreId: string, storedDataId: string) =>
    queryOptions<StoredDataDetails, ApiError>({
        queryKey: RQKeys.datastore_stored_data_details(datastoreId, storedDataId),
        queryFn: ({ signal }) => api.storedData.getDetails(datastoreId, storedDataId, { signal }),
        // sans donnée (erreur au premier chargement), pas de relecture
        refetchInterval: (query) => storedDataRefetchInterval(query.state.data),
    });

export const uploadDetailsQueryOptions = (datastoreId: string, uploadId: string) =>
    queryOptions<DataDetailsUpload, ApiError>({
        queryKey: RQKeys.datastore_upload_details(datastoreId, uploadId),
        queryFn: ({ signal }) => api.upload.getDetails(datastoreId, uploadId, { signal }),
        refetchInterval: (query) => uploadRefetchInterval(query.state.data),
    });

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { DatasheetDetailed } from "@/@types/app";
import api from "@/entrepot/api";
import RQKeys from "@/modules/entrepot/RQKeys";
import { type ApiError } from "@/modules/jsonFetch";

/** suppression d’une livraison de la fiche : retrait immédiat de la liste, puis relecture */
export default function useDeleteUploadMutation(datastoreId: string, datasheetName: string) {
    const queryClient = useQueryClient();
    const queryKey = RQKeys.datastore_datasheet(datastoreId, datasheetName);

    return useMutation<null, ApiError, string>({
        mutationFn: (uploadId) => api.upload.remove(datastoreId, uploadId),
        onSuccess(_data, uploadId) {
            queryClient.setQueryData<DatasheetDetailed>(queryKey, (datasheet) =>
                datasheet ? { ...datasheet, upload_list: datasheet.upload_list?.filter((upload) => upload._id !== uploadId) } : datasheet
            );
            void queryClient.invalidateQueries({ queryKey });
        },
    });
}

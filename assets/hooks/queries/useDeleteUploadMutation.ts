import { useMutation, useQueryClient } from "@tanstack/react-query";

import { DatasheetDetailed } from "@/@types/app";
import api from "@/entrepot/api";
import RQKeys from "@/modules/entrepot/RQKeys";

/** suppression d'une livraison : retrait optimiste de la liste de la fiche puis refetch */
export default function useDeleteUploadMutation(datastoreId: string, datasheetName: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (uploadId: string) => api.upload.remove(datastoreId, uploadId),
        onSuccess(_data, uploadId) {
            queryClient.setQueryData(RQKeys.datastore_datasheet(datastoreId, datasheetName), (datasheet: DatasheetDetailed) => ({
                ...datasheet,
                upload_list: datasheet.upload_list?.filter((upload) => upload._id !== uploadId) ?? [],
            }));
            queryClient.refetchQueries({ queryKey: RQKeys.datastore_datasheet(datastoreId, datasheetName) });
        },
    });
}

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { type Service } from "@/@types/app";
import api from "@/entrepot/api";
import RQKeys from "@/modules/entrepot/RQKeys";
import { type ApiError } from "@/modules/jsonFetch";

/** dépublie un flux (offre puis configuration) ; réservé aux types de `editableOfferingTypes` */
export default function useUnpublishServiceMutation(datastoreId: string, datasheetName: string) {
    const queryClient = useQueryClient();

    return useMutation<null, ApiError, Service>({
        mutationFn: (service) => api.service.unpublishService(datastoreId, service._id),
        // relecture même après un échec : le second DELETE peut échouer alors que l’offre est déjà dépubliée
        onSettled() {
            void queryClient.invalidateQueries({ queryKey: RQKeys.datastore_datasheet_service_list(datastoreId, datasheetName) });
            void queryClient.refetchQueries({ queryKey: RQKeys.datastore_datasheet(datastoreId, datasheetName) });
            void queryClient.refetchQueries({ queryKey: RQKeys.datastore_datasheet_metadata(datastoreId, datasheetName) });
        },
    });
}

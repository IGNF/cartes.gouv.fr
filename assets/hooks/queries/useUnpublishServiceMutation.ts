import { useMutation, useQueryClient } from "@tanstack/react-query";

import { type ServiceListItem } from "@/@types/app";
import api from "@/entrepot/api";
import RQKeys from "@/modules/entrepot/RQKeys";
import { type ApiError } from "@/modules/jsonFetch";

/** dépublie un flux (offre puis configuration) ; réservé aux types de `editableOfferingTypes` */
export default function useUnpublishServiceMutation(datastoreId: string, datasheetName: string) {
    const queryClient = useQueryClient();

    return useMutation<null, ApiError, ServiceListItem>({
        mutationFn: (service) => api.service.unpublishService(datastoreId, service._id),
        // relecture même après un échec : le second DELETE peut échouer alors que l’offre est déjà dépubliée
        onSettled() {
            void queryClient.refetchQueries({ queryKey: RQKeys.datastore_datasheet(datastoreId, datasheetName) });
            void queryClient.refetchQueries({ queryKey: RQKeys.datastore_datasheet_metadata(datastoreId, datasheetName) });
            // le nom technique redevient libre
            void queryClient.invalidateQueries({ queryKey: RQKeys.datastore_layernames(datastoreId) });
            // attendue : la mutation reste en cours (et l’attente affichée) jusqu’à la relecture de la liste
            return queryClient.invalidateQueries({ queryKey: RQKeys.datastore_datasheet_service_list(datastoreId, datasheetName) });
        },
    });
}

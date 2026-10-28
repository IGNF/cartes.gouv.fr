import { useMutation, useQueryClient } from "@tanstack/react-query";

import { type Service } from "@/@types/app";
import api from "@/entrepot/api";
import RQKeys from "@/modules/entrepot/RQKeys";
import { CartesApiException } from "@/modules/jsonFetch";
import { editableOfferingTypes } from "@/utils";

export default function useUnpublishServiceMutation(datastoreId: string, datasheetName: string) {
    const queryClient = useQueryClient();

    return useMutation<null, CartesApiException, Service>({
        mutationFn: (service) => {
            if (!editableOfferingTypes.includes(service.type)) {
                return Promise.reject(`Dépublication de service ${service.type} n’a pas encore été implémentée`);
            }

            return api.service.unpublishService(datastoreId, service._id);
        },
        onSuccess() {
            // relecture plutôt que retrait de la ligne : une offre partiellement supprimée reste listée comme dépubliée
            queryClient.invalidateQueries({ queryKey: RQKeys.datastore_datasheet_service_list(datastoreId, datasheetName) });
            queryClient.refetchQueries({ queryKey: RQKeys.datastore_datasheet(datastoreId, datasheetName) });
            queryClient.refetchQueries({ queryKey: RQKeys.datastore_datasheet_metadata(datastoreId, datasheetName) });
        },
    });
}

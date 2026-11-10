import { useQueries, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef } from "react";

import { DatasheetDetailed, StoredDataStatusEnum } from "@/@types/app";
import api from "@/entrepot/api";
import RQKeys from "@/modules/entrepot/RQKeys";

/**
 * Livraisons vecteur d’une fiche : renvoie celles dont l’intégration a échoué avant le lancement du traitement,
 * et supprime celles dont la donnée stockée est générée (l’utilisateur a quitté le suivi avant la fin).
 */
export default function useUploadIntegrations(datastoreId: string, datasheet: DatasheetDetailed | undefined, canAdvance: boolean): Set<string> {
    const queryClient = useQueryClient();
    const uploads = useMemo(
        () => (datasheet?.upload_list ?? []).filter((upload) => upload.type === "VECTOR" && upload.tags.datasheet_name === datasheet?.name),
        [datasheet]
    );

    // avant le lancement, seul le backend sait si les vérifications ont échoué
    const failedIds = useQueries({
        queries: uploads
            .filter((upload) => upload.tags.vectordb_id === undefined)
            .map((upload) => ({
                queryKey: RQKeys.datastore_upload_integration(datastoreId, upload._id),
                queryFn: ({ signal }: { signal: AbortSignal }) => api.upload.getIntegration(datastoreId, upload._id, { signal }),
                // un état en attente ou en échec ne change pas sans action de l’utilisateur
                refetchInterval: (query: { state: { data?: { status: string } } }) => (query.state.data?.status === "in_progress" ? 3000 : false),
                retry: false,
                select: (integration: { status: string }) => (integration.status === "failed" ? upload._id : null),
            })),
        // chaîne : stable d’un rendu à l’autre tant que la liste ne change pas
        combine: (results) =>
            results
                .map((result) => result.data)
                .filter(Boolean)
                .join(","),
    });

    const cleanedIds = useRef(new Set<string>());
    const datasheetName = datasheet?.name;
    useEffect(() => {
        if (!canAdvance || datasheetName === undefined) return;

        const generatedIds = new Set(
            (datasheet?.vector_db_list ?? []).filter((storedData) => storedData.status === StoredDataStatusEnum.GENERATED).map((storedData) => storedData._id)
        );
        uploads
            .filter((upload) => upload.tags.vectordb_id !== undefined && generatedIds.has(upload.tags.vectordb_id) && !cleanedIds.current.has(upload._id))
            .forEach((upload) => {
                cleanedIds.current.add(upload._id);
                api.upload
                    .advanceIntegration(datastoreId, upload._id)
                    .then(() => queryClient.invalidateQueries({ queryKey: RQKeys.datastore_datasheet(datastoreId, datasheetName) }))
                    // nettoyage silencieux : il sera retenté à la prochaine ouverture de la fiche
                    .catch(() => undefined);
            });
    }, [canAdvance, datastoreId, datasheetName, datasheet?.vector_db_list, uploads, queryClient]);

    return useMemo(() => new Set(failedIds === "" ? [] : failedIds.split(",")), [failedIds]);
}

import { useQueries, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef } from "react";

import { DatasheetDetailed, StoredDataStatusEnum } from "@/@types/app";
import api from "@/entrepot/api";
import RQKeys from "@/modules/entrepot/RQKeys";
import { type ApiError } from "@/modules/jsonFetch";

/**
 * Livraisons vecteur d’une fiche : renvoie celles dont l’intégration a échoué avant le lancement du traitement,
 * et supprime celles dont la donnée stockée est générée (l’utilisateur a quitté le suivi avant la fin) ou supprimée.
 */
export default function useUploadIntegrations(datastoreId: string, datasheet: DatasheetDetailed | undefined, canAdvance: boolean): Set<string> {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
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

        const vectorDbs = datasheet?.vector_db_list ?? [];
        const generatedIds = new Set(
            vectorDbs.filter((storedData) => storedData.status === StoredDataStatusEnum.GENERATED).map((storedData) => storedData._id)
        );
        // absente de la liste : peut-être supprimée ; le serveur lit son vrai statut et ne supprime la livraison que si c’est le cas
        const listedIds = new Set(vectorDbs.map((storedData) => storedData._id));
        const datasheetKey = RQKeys.datastore_datasheet(datastoreId, datasheetName);

        uploads
            .filter(
                ({ _id, tags: { vectordb_id } }) =>
                    vectordb_id !== undefined && (generatedIds.has(vectordb_id) || !listedIds.has(vectordb_id)) && !cleanedIds.current.has(_id)
            )
            .forEach((upload) => {
                cleanedIds.current.add(upload._id);
                api.upload
                    .advanceIntegration(datastoreId, upload._id)
                    .then(() => queryClient.invalidateQueries({ queryKey: datasheetKey }))
                    .then(() => {
                        // la livraison était tout ce qui restait de la fiche
                        if (queryClient.getQueryState<DatasheetDetailed, ApiError>(datasheetKey)?.error?.status === 404) {
                            void navigate({ to: "/tableau-de-bord/entrepots/$datastoreId/donnees", params: { datastoreId } });
                        }
                    })
                    // nettoyage silencieux : il sera retenté à la prochaine ouverture de la fiche
                    .catch(() => undefined);
            });
    }, [canAdvance, datastoreId, datasheetName, datasheet?.vector_db_list, uploads, queryClient, navigate]);

    return useMemo(() => new Set(failedIds === "" ? [] : failedIds.split(",")), [failedIds]);
}

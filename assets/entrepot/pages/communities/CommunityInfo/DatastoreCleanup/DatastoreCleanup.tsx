import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { DatastoreCleanupEntitiesCount } from "@/@types/app";
import LoadingText from "@/components/Utils/LoadingText";
import Progress from "@/components/Utils/Progress";
import { useDatastore } from "@/contexts/datastore";
import api from "@/entrepot/api";
import useEventSource from "@/hooks/useEventSource";
import RQKeys from "@/modules/entrepot/RQKeys";
import { datastoreCleanupModal } from "./datastoreCleanupModal";

type CleanupState = "idle" | "connecting" | "in_progress" | "done" | "error";

type DatastoreCleanupProgress = Record<
    string,
    {
        initialCount: number;
        currentCount: number;
    }
>;

type DatastoreCleanupStreamPayload = {
    entities?: DatastoreCleanupEntitiesCount;
};

type DatastoreCleanupStreamFailedPayload = DatastoreCleanupStreamPayload & {
    message?: string;
};

type DatastoreCleanupStreamEvents = {
    started: DatastoreCleanupStreamPayload;
    progress: DatastoreCleanupStreamPayload;
    done: DatastoreCleanupStreamPayload;
    failed: DatastoreCleanupStreamFailedPayload;
};

const ENTITY_ORDER = ["processing_executions", "offerings", "configurations", "metadata", "statics", "annexes", "uploads", "stored_data"] as const;
const ENTITY_LABELS: Record<(typeof ENTITY_ORDER)[number], string> = {
    processing_executions: "Traitements en attente/en cours",
    offerings: "Offres",
    configurations: "Configurations",
    metadata: "Fiches métadonnées",
    statics: "Fichiers statiques",
    annexes: "Annexes",
    stored_data: "Données stockées",
    uploads: "Livraisons",
};

export default function DatastoreCleanup() {
    const { datastore } = useDatastore();
    const queryClient = useQueryClient();
    const isOpenModal = useIsModalOpen(datastoreCleanupModal);

    const [cleanupState, setCleanupState] = useState<CleanupState>("idle");
    const [streamError, setStreamError] = useState<string | null>(null);
    const [cleanupProgress, setCleanupProgress] = useState<DatastoreCleanupProgress>({});

    const {
        data: cleanupContentData,
        isError: isCleanupContentError,
        isLoading: isCleanupContentLoading,
        refetch: refetchCleanupContent,
    } = useQuery({
        queryKey: RQKeys.datastore_cleanup_content(datastore._id),
        queryFn: () => api.datastore.cleanupGetContent(datastore._id),
        enabled: false,
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });

    function updateCleanupProgress(entitiesCount: DatastoreCleanupEntitiesCount, resetInitial: boolean = false): void {
        setCleanupProgress((prev) => {
            const next: DatastoreCleanupProgress = resetInitial ? {} : { ...prev };

            Object.entries(entitiesCount).forEach(([entityType, currentCount]) => {
                const initialCount = resetInitial ? currentCount : (prev[entityType]?.initialCount ?? currentCount);

                next[entityType] = {
                    initialCount,
                    currentCount,
                };
            });

            return next;
        });
    }

    useEffect(() => {
        if (!cleanupContentData?.entities) {
            return;
        }

        updateCleanupProgress(cleanupContentData.entities, true);
    }, [cleanupContentData]);

    const hasElementsToDelete = Object.values(cleanupProgress).some((entity) => entity.currentCount > 0);
    const isDeleting = cleanupState === "connecting" || cleanupState === "in_progress";

    const {
        status: cleanupStreamStatus,
        connect: connectStream,
        disconnect: disconnectStream,
    } = useEventSource<DatastoreCleanupStreamEvents>({
        url: api.datastore.getCleanupStreamUrl(datastore._id),
        enabled: false,
        handlers: {
            started: (payload) => {
                setCleanupState("in_progress");
                updateCleanupProgress(payload.entities ?? {});
            },
            progress: (payload) => {
                setCleanupState("in_progress");
                updateCleanupProgress(payload.entities ?? {});
            },
            done: (payload) => {
                updateCleanupProgress(payload.entities ?? {});
                setCleanupState("done");
                disconnectStream();
                queryClient.invalidateQueries({ queryKey: RQKeys.datastore(datastore._id) });
                refetchCleanupContent();
            },
            failed: (payload) => {
                updateCleanupProgress(payload.entities ?? {});
                setCleanupState("error");
                setStreamError(payload.message ?? "La suppression a échoué.");
                disconnectStream();
                refetchCleanupContent();
            },
        },
        onError: (error) => {
            if (error.type === "connection") {
                setCleanupState("error");
                setStreamError("La connexion de suppression a été interrompue.");
            }
        },
    });

    function startDeletion(): void {
        if (isDeleting) {
            return;
        }

        setCleanupState("connecting");
        setStreamError(null);
        disconnectStream();
        connectStream();
    }

    useEffect(() => {
        if (cleanupStreamStatus === "connecting") {
            setCleanupState("connecting");
        }
    }, [cleanupStreamStatus]);

    useEffect(() => {
        if (!isOpenModal) {
            disconnectStream();
            setCleanupState("idle");
            setStreamError(null);
            setCleanupProgress({});
            queryClient.removeQueries({ queryKey: RQKeys.datastore_cleanup_content(datastore._id), exact: true });

            return;
        }

        setCleanupState("idle");
        setStreamError(null);
        setCleanupProgress({});
        void refetchCleanupContent();
    }, [datastore._id, disconnectStream, isOpenModal, queryClient, refetchCleanupContent]);

    useEffect(() => {
        return () => {
            disconnectStream();
        };
    }, [disconnectStream]);

    return createPortal(
        <datastoreCleanupModal.Component
            title="Vider l'entrepôt"
            buttons={[
                {
                    children: "Annuler",
                    priority: "secondary",
                    doClosesModal: true,
                    onClick: disconnectStream,
                },
                cleanupState === "done"
                    ? {
                          children: "Continuer",
                          doClosesModal: true,
                      }
                    : {
                          children: isDeleting ? "Suppression en cours" : "Vider l'entrepôt",
                          onClick: startDeletion,
                          disabled: isDeleting || !hasElementsToDelete,
                          doClosesModal: false,
                      },
            ]}
            concealingBackdrop={false}
        >
            {isCleanupContentError && <Alert severity="error" title="Le recomptage des éléments à supprimer a échoué." closable />}

            {streamError && <Alert severity="error" title={streamError} closable />}

            {isCleanupContentLoading ? (
                <LoadingText message="Récupération des éléments à supprimer..." as="p" withSpinnerIcon className={fr.cx("fr-mt-4v")} />
            ) : (
                <>
                    {cleanupState !== "done" && hasElementsToDelete && (
                        <p className={fr.cx("fr-m-0")}>
                            Tout le contenu de votre entrepôt sera supprimé et les traitements en cours seront arrêtés. Êtes-vous sûr de vouloir continuer ?
                            Cette action est irréversible.
                        </p>
                    )}

                    {cleanupState === "idle" && (
                        <ul>
                            {ENTITY_ORDER.map((entityType) => {
                                const total = cleanupProgress[entityType]?.initialCount ?? 0;

                                const name = ENTITY_LABELS[entityType] ?? entityType;

                                return (
                                    <li key={entityType}>
                                        <strong>{name}</strong> : {total}
                                    </li>
                                );
                            })}
                        </ul>
                    )}

                    {cleanupState === "connecting" && <LoadingText message="Suppression en cours..." as="p" withSpinnerIcon className={fr.cx("fr-mt-4v")} />}

                    {cleanupState === "in_progress" && (
                        <ul>
                            {Object.entries(cleanupProgress)
                                .filter(([, { initialCount }]) => initialCount > 0)
                                .map(([entityType, { initialCount, currentCount }]) => {
                                    const name = ENTITY_LABELS[entityType] ?? entityType;
                                    return (
                                        <li key={entityType} className={fr.cx("fr-mb-2v")}>
                                            <Progress label={name} value={initialCount - currentCount} max={initialCount} />
                                        </li>
                                    );
                                })}
                        </ul>
                    )}

                    {cleanupState === "done" && (
                        <p className={fr.cx("fr-mt-2v")}>
                            <Alert severity="success" title="Suppression terminée" closable={false} />
                        </p>
                    )}
                </>
            )}
        </datastoreCleanupModal.Component>,
        document.body
    );
}

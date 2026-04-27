import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { DatastoreCleanupEntitiesCount, FailedCleanupItem } from "@/@types/app";
import LoadingText from "@/components/Utils/LoadingText";
import Progress from "@/components/Utils/Progress";
import { useCommunity } from "@/contexts/community";
import { useDatastore } from "@/contexts/datastore";
import api from "@/entrepot/api";
import useEventSource from "@/hooks/useEventSource";
import RQKeys from "@/modules/entrepot/RQKeys";
import { routes } from "@/router/router";
import { deleteCommunityModal } from "./deleteCommunityModal";

type DeleteCommunityState = "disclaimer" | "loading" | "confirm" | "connecting" | "cleanup_progress" | "deleting" | "error" | "mail_sent";

type DatastoreCleanupProgress = Record<string, { initialCount: number; currentCount: number }>;

type DatastoreCleanupStreamPayload = { entities?: DatastoreCleanupEntitiesCount };
type DatastoreCleanupStreamDonePayload = DatastoreCleanupStreamPayload & { failedItems?: FailedCleanupItem[] };
type DatastoreCleanupStreamFailedPayload = DatastoreCleanupStreamPayload & { message?: string };
type DatastoreCleanupStreamEvents = {
    started: DatastoreCleanupStreamPayload;
    progress: DatastoreCleanupStreamPayload;
    done: DatastoreCleanupStreamDonePayload;
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

export default function DeleteCommunity() {
    const { datastore } = useDatastore();
    const community = useCommunity();
    const queryClient = useQueryClient();
    const isOpenModal = useIsModalOpen(deleteCommunityModal);

    const [state, setState] = useState<DeleteCommunityState>("disclaimer");
    const [streamError, setStreamError] = useState<string | null>(null);
    const [deletionError, setDeletionError] = useState<string | null>(null);
    const [cleanupProgress, setCleanupProgress] = useState<DatastoreCleanupProgress>({});

    const {
        data: cleanupContentData,
        isError: isCleanupContentError,
        isLoading: isCleanupContentLoading,
        refetch: refetchCleanupContent,
    } = useQuery({
        queryKey: RQKeys.datastore_cleanup_content(datastore._id),
        queryFn: ({ signal }) => api.datastore.cleanupGetContent(datastore._id, { signal }),
        enabled: false,
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });

    function updateCleanupProgress(entitiesCount: DatastoreCleanupEntitiesCount, resetInitial = false): void {
        setCleanupProgress((prev) => {
            const next: DatastoreCleanupProgress = resetInitial ? {} : { ...prev };
            Object.entries(entitiesCount).forEach(([entityType, currentCount]) => {
                const initialCount = resetInitial ? currentCount : (prev[entityType]?.initialCount ?? currentCount);
                next[entityType] = { initialCount, currentCount };
            });
            return next;
        });
    }

    useEffect(() => {
        if (!cleanupContentData?.entities) return;
        updateCleanupProgress(cleanupContentData.entities, true);
        setState((current) => (current === "loading" ? "confirm" : current));
    }, [cleanupContentData]);

    useEffect(() => {
        if (isCleanupContentError) {
            setState((current) => (current === "loading" ? "confirm" : current));
        }
    }, [isCleanupContentError]);

    const hasContent = Object.values(cleanupProgress).some((e) => e.currentCount > 0);
    const isActive = state === "connecting" || state === "cleanup_progress" || state === "deleting";

    const deleteCommunityMutation = useMutation({
        mutationFn: (failedItems: FailedCleanupItem[]) =>
            api.contact.requestDatastoreDeletion({ datastoreId: datastore._id, communityId: community._id, failedItems }),
        onSuccess: () => {
            setState("mail_sent");
        },
        onError: (err: Error) => {
            setState("error");
            setDeletionError(err.message ?? "La suppression de l'entrepôt a échoué.");
        },
    });

    const { connect: connectStream, disconnect: disconnectStream } = useEventSource<DatastoreCleanupStreamEvents>({
        url: api.datastore.getCleanupStreamUrl(datastore._id),
        autoConnect: false,
        handlers: {
            started: (payload) => {
                setState("cleanup_progress");
                updateCleanupProgress(payload.entities ?? {});
            },
            progress: (payload) => {
                setState("cleanup_progress");
                updateCleanupProgress(payload.entities ?? {});
            },
            done: (payload) => {
                updateCleanupProgress(payload.entities ?? {});
                disconnectStream();
                setState("deleting");
                deleteCommunityMutation.mutate(payload.failedItems ?? []);
            },
            failed: (payload) => {
                updateCleanupProgress(payload.entities ?? {});
                setState("error");
                setStreamError(payload.message ?? "La suppression du contenu a échoué.");
                disconnectStream();
                void refetchCleanupContent();
            },
        },
        onError: (error) => {
            if (error.type === "connection") {
                setState("error");
                setStreamError("La connexion de suppression a été interrompue.");
            }
        },
    });

    function startDeletion(): void {
        if (isActive) return;
        setStreamError(null);
        setDeletionError(null);

        if (hasContent || isCleanupContentError) {
            setState("connecting");
            disconnectStream();
            connectStream();
        } else {
            setState("deleting");
            deleteCommunityMutation.mutate([]);
        }
    }

    useEffect(() => {
        if (!isOpenModal) {
            disconnectStream();
            setState("disclaimer");
            setStreamError(null);
            setDeletionError(null);
            setCleanupProgress({});
            queryClient.removeQueries({ queryKey: RQKeys.datastore_cleanup_content(datastore._id), exact: true });
            return;
        }

        setState("disclaimer");
        setStreamError(null);
        setDeletionError(null);
        setCleanupProgress({});
        void refetchCleanupContent();
    }, [datastore._id, disconnectStream, isOpenModal, queryClient, refetchCleanupContent]);

    useEffect(() => {
        return () => {
            disconnectStream();
        };
    }, [disconnectStream]);

    function proceedFromDisclaimer(): void {
        setState(isCleanupContentLoading ? "loading" : "confirm");
    }

    const confirmButtonLabel = hasContent ? "Vider et supprimer" : "Supprimer l'entrepôt";
    const isLoading = state === "loading";

    return createPortal(
        state === "mail_sent" ? (
            <deleteCommunityModal.Component
                title={"Demande de suppression envoyée"}
                buttons={[
                    {
                        children: "Continuer",
                        onClick: () => {
                            routes.datastore_selection().push();
                        },
                    },
                ]}
            >
                {null}
            </deleteCommunityModal.Component>
        ) : (
            <deleteCommunityModal.Component
                title={"Demander la suppression de l'entrepôt"}
                concealingBackdrop={false}
                buttons={[
                    {
                        children: "Annuler",
                        priority: "secondary",
                        onClick: disconnectStream,
                    },
                    state === "disclaimer"
                        ? { children: "Continuer", onClick: proceedFromDisclaimer, doClosesModal: false }
                        : {
                              children: isActive ? "Suppression en cours..." : confirmButtonLabel,
                              onClick: startDeletion,
                              disabled: isActive || isLoading,
                              doClosesModal: false,
                          },
                ]}
            >
                {isCleanupContentError && <Alert severity="error" title="Impossible de récupérer le contenu de l'entrepôt." closable />}

                {streamError && <Alert severity="error" title={streamError} closable />}

                {deletionError && <Alert severity="error" title={deletionError} closable />}

                {state === "disclaimer" && (
                    <>
                        <p>Si vous supprimez votre entrepôt :</p>
                        <ul>
                            <li>L’ensemble des données et des fichiers seront supprimés ;</li>
                            <li>Les données publiées ne seront plus visibles et accessibles dans les services de cartes.gouv.fr ;</li>
                            <li>Il vous appartient de prévenir les membres de la suppression de l’entrepôt.</li>
                        </ul>
                        <p>
                            À savoir : les opérateurs de cartes.gouv.fr ne peuvent être tenus pour responsables des conséquences de la suppression d’un entrepôt
                            par son administrateur ou de tout utilisateur en ayant les droits.
                        </p>
                    </>
                )}

                {isLoading ? (
                    <LoadingText message="Récupération du contenu de l’entrepôt..." as="p" withSpinnerIcon className={fr.cx("fr-mt-4v")} />
                ) : (
                    <>
                        {state === "confirm" && (
                            <>
                                {hasContent ? (
                                    <>
                                        <Alert
                                            severity="warning"
                                            title="L'entrepôt contient des données"
                                            description="Le contenu doit être supprimé avant de pouvoir supprimer l'entrepôt. Cette action est irréversible."
                                            small
                                            className={fr.cx("fr-mb-2v")}
                                        />
                                        <ul className={fr.cx("fr-raw-list")}>
                                            {ENTITY_ORDER.map((entityType) => {
                                                const total = cleanupProgress[entityType]?.currentCount ?? 0;
                                                const name = ENTITY_LABELS[entityType] ?? entityType;
                                                return (
                                                    <li key={entityType} className={fr.cx("fr-my-2v")}>
                                                        <strong>{name}</strong> : {total}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </>
                                ) : (
                                    <p className={fr.cx("fr-m-0")}>Êtes-vous sûr.e de vouloir supprimer cet entrepôt ?</p>
                                )}
                            </>
                        )}

                        {state === "connecting" && <LoadingText message="En cours de préparation..." as="p" withSpinnerIcon className={fr.cx("fr-mt-4v")} />}

                        {state === "cleanup_progress" && (
                            <ul className={fr.cx("fr-raw-list")}>
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

                        {state === "deleting" && (
                            <LoadingText message="Envoi de la demande de suppression en cours..." as="p" withSpinnerIcon className={fr.cx("fr-mt-4v")} />
                        )}

                        {state === "error" && hasContent && (
                            <ul className={fr.cx("fr-raw-list")}>
                                {ENTITY_ORDER.map((entityType) => {
                                    const total = cleanupProgress[entityType]?.currentCount ?? 0;
                                    const name = ENTITY_LABELS[entityType] ?? entityType;
                                    return (
                                        <li key={entityType}>
                                            <strong>{name}</strong> : {total}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </>
                )}
            </deleteCommunityModal.Component>
        ),
        document.body
    );
}

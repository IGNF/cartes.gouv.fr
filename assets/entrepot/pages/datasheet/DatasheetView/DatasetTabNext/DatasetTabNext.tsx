import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import Notice from "@codegouvfr/react-dsfr/Notice";
import { SegmentedControl } from "@codegouvfr/react-dsfr/SegmentedControl";
import Table from "@codegouvfr/react-dsfr/Table";
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { useStyles } from "tss-react";

import { DatasheetDetailed, DatasheetUploadItem } from "@/@types/app";
import { CommunityMemberDtoRightsEnum } from "@/@types/entrepot";
import StoredDataStatusBadge from "@/components/Utils/Badges/StoredDataStatusBadge";
import LoadingText from "@/components/Utils/LoadingText";
import api from "@/entrepot/api";
import useCommunityRights from "@/hooks/useCommunityRights";
import RQKeys from "@/modules/entrepot/RQKeys";
import { CartesApiException } from "@/modules/jsonFetch";
import { routes } from "@/router/router";
import { formatDateFromISO } from "@/utils";
import DatasetAddBanners from "./DatasetAddBanners";

type DatasetType = "vector" | "raster";
type TypeFilter = "all" | DatasetType;

type DatasetRow = {
    id: string;
    name: string;
    type: DatasetType;
    creation?: string;
    status: ReactNode;
    action: ReactNode;
};

const parseIntegrationProgress = (rawProgress: string | undefined): Record<string, string> | null => {
    if (!rawProgress) {
        return null;
    }

    try {
        const parsed = JSON.parse(rawProgress);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
            return parsed as Record<string, string>;
        }
    } catch {
        // ignore les erreurs de parsing JSON
    }

    return null;
};

const uploadHasFailure = (upload: DatasheetUploadItem): boolean => {
    const progress = parseIntegrationProgress(upload.tags.integration_progress);
    return progress !== null && Object.values(progress).includes("failed");
};

type DatasetTabNextProps = {
    datastoreId: string;
    datasheetName: string;
};

export default function DatasetTabNext({ datastoreId, datasheetName }: DatasetTabNextProps) {
    const queryClient = useQueryClient();

    const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

    const { userRights, isSupervisor } = useCommunityRights();
    const canAddData =
        isSupervisor || (userRights?.includes(CommunityMemberDtoRightsEnum.UPLOAD) && userRights?.includes(CommunityMemberDtoRightsEnum.PROCESSING));

    // Récupération de la fiche — dédupliquée par React Query avec la query identique du composant parent
    const datasheetQuery = useQuery<DatasheetDetailed, CartesApiException>({
        queryKey: RQKeys.datastore_datasheet(datastoreId, datasheetName),
        queryFn: ({ signal }) => api.datasheet.get(datastoreId, datasheetName, { signal }),
        staleTime: 60000,
        retry: false,
    });
    const datasheet = datasheetQuery.data;

    const datasheetUploads = useMemo(
        () => datasheet?.upload_list?.filter((upload) => upload.type === "VECTOR" && upload.tags.datasheet_name === datasheetName) ?? [],
        [datasheet, datasheetName]
    );

    // livraisons affichées dans le tableau : traitement d'intégration pas encore lancé
    // (dès qu'il est lancé, la donnée stockée existe et prend le relais dans le tableau)
    const unfinishedUploads = useMemo(() => {
        return datasheetUploads.filter((upload) => {
            if (upload.tags.integration_progress === undefined) {
                return true;
            }

            const progress = parseIntegrationProgress(upload.tags.integration_progress);
            return progress !== null && progress["integration_processing"] === "waiting";
        });
    }, [datasheetUploads]);

    // livraisons dont l'intégration doit encore avancer : toutes celles sans échec, y compris
    // celles dont le traitement est lancé (le ping finalise l'intégration et supprime la livraison)
    const uploadsInProgress = useMemo(() => datasheetUploads.filter((upload) => !uploadHasFailure(upload)), [datasheetUploads]);

    // fait avancer l'intégration des livraisons en cours en arrière-plan (envoi des fichiers, vérifications, traitement)
    const integrationPingQueries = useQueries({
        queries: uploadsInProgress.map((upload) => ({
            queryKey: RQKeys.datastore_upload_integration(datastoreId, upload._id),
            queryFn: ({ signal }: { signal?: AbortSignal }) => api.upload.pingIntegrationProgress(datastoreId, upload._id, { signal }),
            refetchInterval: (query: { state: { status: string } }) => (query.state.status === "error" ? false : 3000),
            refetchIntervalInBackground: true,
            retry: false,
            staleTime: 0,
        })),
    });

    // rafraîchit la fiche dès qu'une étape d'intégration change d'état
    const progressSignature = integrationPingQueries.map((query) => query.data?.integration_progress ?? "").join("|");
    useEffect(() => {
        if (progressSignature.replaceAll("|", "") !== "") {
            queryClient.invalidateQueries({ queryKey: RQKeys.datastore_datasheet(datastoreId, datasheetName) });
        }
    }, [progressSignature, datastoreId, datasheetName, queryClient]);

    const rows = useMemo<DatasetRow[]>(() => {
        if (!datasheet) {
            return [];
        }

        const uploadRows: DatasetRow[] = unfinishedUploads.map((upload) => {
            const failed = uploadHasFailure(upload);
            return {
                id: upload._id,
                name: upload.name,
                type: "vector",
                creation: upload.creation,
                status: (
                    <Badge noIcon severity={failed ? "error" : "info"}>
                        {failed ? "Échoué" : "En cours"}
                    </Badge>
                ),
                action: failed ? (
                    <Button
                        priority="secondary"
                        size="small"
                        linkProps={routes.datastore_upload_details({ datastoreId, uploadId: upload._id, datasheetName }).link}
                    >
                        Voir le rapport
                    </Button>
                ) : null,
            };
        });

        const storedDataRows: DatasetRow[] = [
            ...(datasheet.vector_db_list ?? []).map((storedData) => ({ storedData, type: "vector" as DatasetType })),
            ...(datasheet.pyramid_vector_list ?? []).map((storedData) => ({ storedData, type: "vector" as DatasetType })),
            ...(datasheet.pyramid_raster_list ?? []).map((storedData) => ({ storedData, type: "raster" as DatasetType })),
        ].map(({ storedData, type }) => ({
            id: storedData._id,
            name: storedData.name,
            type,
            creation: storedData.creation,
            status: <StoredDataStatusBadge status={storedData.status} />,
            action: (
                <Button
                    priority="secondary"
                    size="small"
                    linkProps={routes.datastore_stored_data_details({ datastoreId, storedDataId: storedData._id, datasheetName }).link}
                >
                    Consulter
                </Button>
            ),
        }));

        // du plus récent au plus ancien
        return [...uploadRows, ...storedDataRows].sort((a, b) => (b.creation ?? "").localeCompare(a.creation ?? ""));
    }, [datasheet, unfinishedUploads, datastoreId, datasheetName]);

    const filteredRows = useMemo(() => (typeFilter === "all" ? rows : rows.filter((row) => row.type === typeFilter)), [rows, typeFilter]);

    const addDataLink = routes.datastore_dataset_add_next({ datastoreId, datasheetName }).link;

    const { css, cx } = useStyles();

    if (datasheetQuery.isLoading) {
        return <LoadingText withSpinnerIcon={true} as="p" />;
    }

    if (datasheetQuery.isError) {
        return <Alert severity="error" title="Erreur lors du chargement de la fiche de données" description={datasheetQuery.error.message} closable={false} />;
    }

    return (
        <>
            {uploadsInProgress.length > 0 && (
                <Notice
                    className={fr.cx("fr-mb-2w")}
                    title="Donnée en cours de chargement"
                    description="Vous recevrez un courriel vous indiquant la fin du chargement."
                    isClosable
                />
            )}

            <div
                className={cx(
                    fr.cx("fr-container", "fr-py-4w"),
                    css({
                        backgroundColor: fr.colors.decisions.background.default.grey.default,
                    })
                )}
            >
                <h2 className={fr.cx("fr-h5", "fr-mb-1w")}>Données</h2>

                <DatasetAddBanners />

                {rows.length === 0 ? (
                    <div
                        className={cx(
                            fr.cx("fr-mt-4w", "fr-py-8w"),
                            css({
                                display: "flex",
                                justifyContent: "center",
                                border: `1px dashed ${fr.colors.decisions.border.default.grey.default}`,
                            })
                        )}
                    >
                        {canAddData ? <Button linkProps={addDataLink}>Ajouter une donnée</Button> : <p className={fr.cx("fr-m-0")}>Aucune donnée</p>}
                    </div>
                ) : (
                    <>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-mt-4w")}>
                            <div className={fr.cx("fr-col")}>
                                <SegmentedControl
                                    hideLegend
                                    legend="Filtrer par type de donnée"
                                    name="dataset-type-filter"
                                    segments={[
                                        {
                                            label: "Tous",
                                            nativeInputProps: { checked: typeFilter === "all", onChange: () => setTypeFilter("all") },
                                        },
                                        {
                                            label: "Vecteur",
                                            nativeInputProps: { checked: typeFilter === "vector", onChange: () => setTypeFilter("vector") },
                                        },
                                        {
                                            label: "Raster",
                                            nativeInputProps: { checked: typeFilter === "raster", onChange: () => setTypeFilter("raster") },
                                        },
                                    ]}
                                />
                            </div>
                            {canAddData && (
                                <div className={css({ marginLeft: "auto" })}>
                                    <Button iconId="fr-icon-add-line" linkProps={addDataLink}>
                                        Ajouter une donnée
                                    </Button>
                                </div>
                            )}
                        </div>

                        <p className={fr.cx("fr-text--sm", "fr-mt-3w", "fr-mb-1w")}>
                            {filteredRows.length} résultat{filteredRows.length > 1 ? "s" : ""}
                        </p>

                        <Table
                            caption="Jeux de données"
                            noCaption
                            fixed
                            headers={["Jeu de données", "Type", "Date de publication", "Statut", "Action"]}
                            data={filteredRows.map((row) => [
                                row.name,
                                <Badge
                                    key={`type-${row.id}`}
                                    small
                                    noIcon
                                    className={fr.cx(row.type === "vector" ? "fr-badge--blue-cumulus" : "fr-badge--purple-glycine")}
                                >
                                    {row.type === "vector" ? "Vecteur" : "Raster"}
                                </Badge>,
                                row.creation ? formatDateFromISO(row.creation) : "",
                                row.status,
                                row.action,
                            ])}
                        />
                    </>
                )}
            </div>
        </>
    );
}

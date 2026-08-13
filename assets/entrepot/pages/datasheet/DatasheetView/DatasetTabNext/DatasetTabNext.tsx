import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import Notice from "@codegouvfr/react-dsfr/Notice";
import { SegmentedControl } from "@codegouvfr/react-dsfr/SegmentedControl";
import Table from "@codegouvfr/react-dsfr/Table";
import { useQuery } from "@tanstack/react-query";
import { ReactNode, useMemo, useState } from "react";
import { useStyles } from "tss-react";

import { DatasheetDetailed } from "@/@types/app";
import { CommunityMemberDtoRightsEnum } from "@/@types/entrepot";
import StoredDataStatusBadge from "@/components/Utils/Badges/StoredDataStatusBadge";
import LoadingText from "@/components/Utils/LoadingText";
import Wait from "@/components/Utils/Wait";
import api from "@/entrepot/api";
import useCommunityRights from "@/hooks/useCommunityRights";
import RQKeys from "@/modules/entrepot/RQKeys";
import { CartesApiException } from "@/modules/jsonFetch";
import { routes } from "@/router/router";
import { formatDateFromISO, getDatasheetPublicationsCount, parseIntegrationProgress } from "@/utils";
import useDeleteUploadMutation from "../../../../../hooks/queries/useDeleteUploadMutation";
import DatasheetViewTab from "../../DatasheetViewTab";
import { deleteUploadConfirmModal } from "../DatasheetView/DatasheetViewNext";
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

type DatasetTabNextProps = {
    datastoreId: string;
    datasheetName: string;
};

export default function DatasetTabNext({ datastoreId, datasheetName }: DatasetTabNextProps) {
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

    // analyse du tag integration_progress, une seule fois par livraison
    const parsedUploads = useMemo(
        () =>
            datasheetUploads.map((upload) => {
                const progress = parseIntegrationProgress(upload.tags.integration_progress);
                const statuses = Object.values(progress ?? {});
                // pas encore lancée : tag absent ou étape d'intégration toujours en attente
                const notLaunched = upload.tags.integration_progress === undefined || (progress !== null && progress["integration_processing"] === "waiting");
                const failed = statuses.includes("failed");

                return {
                    upload,
                    failed,
                    notLaunched,
                    // intégration réellement en cours : lancée, sans échec ni totalement réussie
                    inProgress: progress !== null && !notLaunched && !failed && !statuses.every((status) => status === "successful"),
                };
            }),
        [datasheetUploads]
    );

    // livraisons affichées dans le tableau : traitement d'intégration pas encore lancé
    // (dès qu'il est lancé, la donnée stockée existe et prend le relais dans le tableau)
    const unfinishedUploads = useMemo(() => parsedUploads.filter(({ notLaunched }) => notLaunched), [parsedUploads]);

    const hasUploadInProgress = parsedUploads.some(({ inProgress }) => inProgress);

    // publications existantes : supprimer la dernière livraison d'une fiche sans publication supprime la fiche entière
    const isLastUpload = unfinishedUploads.length === 1 && getDatasheetPublicationsCount(datasheet) === 0;

    const { mutate: deleteUnfinishedUpload, isPending: isDeletingUpload } = useDeleteUploadMutation(datastoreId, datasheetName);

    const rows = useMemo<DatasetRow[]>(() => {
        if (!datasheet) {
            return [];
        }

        const uploadRows: DatasetRow[] = unfinishedUploads.map(({ upload, failed }) => {
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
                action: (
                    <>
                        {failed ? (
                            <Button
                                priority="secondary"
                                size="small"
                                linkProps={routes.datastore_upload_details({ datastoreId, uploadId: upload._id, datasheetName }).link}
                            >
                                Voir le rapport
                            </Button>
                        ) : (
                            canAddData && (
                                <Button
                                    priority="secondary"
                                    size="small"
                                    linkProps={
                                        routes.datastore_datasheet_upload_integration({
                                            datastoreId,
                                            uploadId: upload._id,
                                            datasheetName,
                                            datasheetViewVariant: "next",
                                        }).link
                                    }
                                >
                                    Reprendre l’intégration
                                </Button>
                            )
                        )}
                        {canAddData && (
                            <Button
                                className={fr.cx("fr-ml-2v")}
                                iconId="fr-icon-delete-fill"
                                priority="secondary"
                                size="small"
                                onClick={() => {
                                    if (isLastUpload) {
                                        deleteUploadConfirmModal.open();
                                    } else {
                                        deleteUnfinishedUpload(upload._id);
                                    }
                                }}
                            >
                                Supprimer
                            </Button>
                        )}
                    </>
                ),
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
    }, [datasheet, unfinishedUploads, datastoreId, datasheetName, canAddData, isLastUpload, deleteUnfinishedUpload]);

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
            {hasUploadInProgress && (
                <Notice
                    className={fr.cx("fr-mb-2w")}
                    title="Donnée en cours de chargement"
                    description="Vous recevrez un courriel vous indiquant la fin du chargement."
                    isClosable
                />
            )}

            <DatasheetViewTab>
                <h2 className={fr.cx("fr-h5", "fr-mb-10v")}>Données</h2>

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
                            headers={["Jeu de données", "Type", "Date de création", "Statut", "Action"]}
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
            </DatasheetViewTab>

            {isDeletingUpload && (
                <Wait>
                    <div className={fr.cx("fr-grid-row")}>
                        <LoadingText as="h6" message="Suppression de la livraison en cours ..." withSpinnerIcon={true} />
                    </div>
                </Wait>
            )}
        </>
    );
}

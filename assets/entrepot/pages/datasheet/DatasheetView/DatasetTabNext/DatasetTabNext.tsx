import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import Notice from "@codegouvfr/react-dsfr/Notice";
import { SegmentedControl } from "@codegouvfr/react-dsfr/SegmentedControl";
import Table from "@codegouvfr/react-dsfr/Table";
import { useQuery } from "@tanstack/react-query";
import { ReactNode, useMemo, useState } from "react";
import { tss } from "tss-react";

import { DatasheetDetailed, StoredDataStatusEnum } from "@/@types/app";
import { CommunityMemberDtoRightsEnum, StoredDataPrivateDetailResponseDtoTypeEnum as StoredDataTypeEnum } from "@/@types/entrepot";
import StoredDataStatusBadge from "@/components/Utils/Badges/StoredDataStatusBadge";
import LoadingText from "@/components/Utils/LoadingText";
import Wait from "@/components/Utils/Wait";
import api from "@/entrepot/api";
import useDeleteUploadMutation from "@/hooks/queries/useDeleteUploadMutation";
import useUploadIntegrations from "@/hooks/queries/useUploadIntegrations";
import useCommunityRights from "@/hooks/useCommunityRights";
import { useTranslation } from "@/i18n";
import { getApiErrorMessage } from "@/modules/apiError";
import RQKeys from "@/modules/entrepot/RQKeys";
import { type ApiError } from "@/modules/jsonFetch";
import { formatDateFromISO } from "@/utils";
import DatasheetViewTab from "../../DatasheetViewTab";
import DatasetAddBanners from "./DatasetAddBanners";

type StoredDataType = `${StoredDataTypeEnum.VECTORDB | StoredDataTypeEnum.ROK4PYRAMIDVECTOR | StoredDataTypeEnum.ROK4PYRAMIDRASTER}`;
type TypeFilter = "all" | StoredDataType;

const FILTERS = [
    { value: "all", label: "filter.all" },
    { value: "VECTOR-DB", label: "filter.vector_db" },
    { value: "ROK4-PYRAMID-VECTOR", label: "filter.pyramid_vector" },
    { value: "ROK4-PYRAMID-RASTER", label: "filter.pyramid_raster" },
] as const satisfies { value: TypeFilter; label: string }[];

type DatasetRow = {
    id: string;
    name: string;
    type: StoredDataType;
    creation?: string;
    status: ReactNode;
    action: ReactNode;
};

type DatasetTabNextProps = {
    datastoreId: string;
    datasheetName: string;
    /** une fiche avec fiche de métadonnées survit à la suppression de sa dernière livraison */
    hasMetadata: boolean;
    /** ouvre la confirmation de suppression de la fiche entière */
    onDeleteDatasheet: () => void;
};

export default function DatasetTabNext({ datastoreId, datasheetName, hasMetadata, onDeleteDatasheet }: DatasetTabNextProps) {
    const { t } = useTranslation("DatasetTabNext");
    const { classes } = useStyles();
    const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

    const { userRights, isSupervisor } = useCommunityRights();
    const canAddData =
        isSupervisor || (userRights?.includes(CommunityMemberDtoRightsEnum.UPLOAD) && userRights?.includes(CommunityMemberDtoRightsEnum.PROCESSING));

    // même requête que la page de la fiche : servie par le cache
    const datasheetQuery = useQuery<DatasheetDetailed, ApiError>({
        queryKey: RQKeys.datastore_datasheet(datastoreId, datasheetName),
        queryFn: ({ signal }) => api.datasheet.get(datastoreId, datasheetName, { signal }),
        staleTime: 60000,
        retry: false,
    });
    const datasheet = datasheetQuery.data;

    const failedUploadIds = useUploadIntegrations(datastoreId, datasheet, canAddData ?? false);

    const deleteUpload = useDeleteUploadMutation(datastoreId, datasheetName);
    const { mutate: deleteUploadMutate } = deleteUpload;

    const { rows, hasIntegrationInProgress } = useMemo(() => {
        if (!datasheet) {
            return { rows: [], hasIntegrationInProgress: false };
        }

        const vectorDbs = datasheet.vector_db_list ?? [];
        const uploads = (datasheet.upload_list ?? [])
            .filter((upload) => upload.type === "VECTOR" && upload.tags.datasheet_name === datasheetName)
            .map((upload) => {
                const failed = failedUploadIds.has(upload._id);
                const notLaunched = upload.tags.vectordb_id === undefined;
                // traitement lancé : la donnée stockée produite porte l’état
                const vectorDb = vectorDbs.find((storedData) => storedData._id === upload.tags.vectordb_id);
                const inProgress =
                    !notLaunched && !failed && (vectorDb?.status === StoredDataStatusEnum.CREATED || vectorDb?.status === StoredDataStatusEnum.GENERATING);
                return { upload, failed, notLaunched, inProgress };
            });

        const storedDataCount = vectorDbs.length + (datasheet.pyramid_vector_list?.length ?? 0) + (datasheet.pyramid_raster_list?.length ?? 0);
        // dernière livraison d’une fiche sans donnée stockée ni fiche de métadonnées : la supprimer supprime la fiche
        const deletingRemovesDatasheet = uploads.length === 1 && storedDataCount === 0 && !hasMetadata;

        // livraisons dont l’intégration n’est pas lancée ; ensuite la donnée stockée prend le relais
        const uploadRows: DatasetRow[] = uploads
            .filter(({ notLaunched }) => notLaunched)
            .map(({ upload, failed }) => ({
                id: upload._id,
                name: upload.name,
                type: "VECTOR-DB",
                creation: upload.creation,
                status: (
                    <Badge noIcon severity={failed ? "error" : "info"}>
                        {failed ? t("status.failed") : t("status.in_progress")}
                    </Badge>
                ),
                action: (
                    <>
                        {failed ? (
                            <Button
                                priority="secondary"
                                size="small"
                                linkProps={{
                                    to: "/tableau-de-bord/entrepots/$datastoreId/livraisons/$uploadId/rapport",
                                    params: { datastoreId, uploadId: upload._id },
                                    search: { datasheetName },
                                }}
                            >
                                {t("view_report")}
                            </Button>
                        ) : (
                            canAddData && (
                                <Button
                                    priority="secondary"
                                    size="small"
                                    linkProps={{
                                        to: "/tableau-de-bord/entrepots/$datastoreId/donnees/integration",
                                        params: { datastoreId },
                                        search: { uploadId: upload._id, datasheetName, vue: "nouvelle" },
                                    }}
                                >
                                    {t("resume_integration")}
                                </Button>
                            )
                        )}
                        {canAddData && (
                            <Button
                                className={fr.cx("fr-ml-2v")}
                                iconId="fr-icon-delete-line"
                                priority="secondary"
                                size="small"
                                onClick={() => (deletingRemovesDatasheet ? onDeleteDatasheet() : deleteUploadMutate(upload._id))}
                            >
                                {t("delete")}
                            </Button>
                        )}
                    </>
                ),
            }));

        const storedDataRows: DatasetRow[] = [...vectorDbs, ...(datasheet.pyramid_vector_list ?? []), ...(datasheet.pyramid_raster_list ?? [])].map(
            (storedData) => ({
                id: storedData._id,
                // certaines données créées hors de cartes.gouv.fr n’ont pas de nom
                name: storedData.name || storedData._id,
                type: storedData.type as StoredDataType,
                creation: storedData.creation,
                status: <StoredDataStatusBadge status={storedData.status} />,
                action: (
                    <Button
                        priority="secondary"
                        size="small"
                        linkProps={{
                            to: "/tableau-de-bord/entrepots/$datastoreId/donnees/$storedDataId/details",
                            params: { datastoreId, storedDataId: storedData._id },
                            search: { datasheetName },
                        }}
                    >
                        {t("view")}
                    </Button>
                ),
            })
        );

        return {
            // du plus récent au plus ancien
            rows: [...uploadRows, ...storedDataRows].sort((a, b) => (b.creation ?? "").localeCompare(a.creation ?? "")),
            hasIntegrationInProgress: uploads.some(({ inProgress }) => inProgress),
        };
    }, [datasheet, datasheetName, datastoreId, hasMetadata, canAddData, failedUploadIds, deleteUploadMutate, onDeleteDatasheet, t]);

    const filteredRows = typeFilter === "all" ? rows : rows.filter((row) => row.type === typeFilter);
    const segment = ({ value, label }: (typeof FILTERS)[number]) => ({
        label: t(label),
        nativeInputProps: { checked: typeFilter === value, onChange: () => setTypeFilter(value) },
    });
    const addDataLink = { to: "/tableau-de-bord/entrepots/$datastoreId/donnees/$datasheetName/televersement", params: { datastoreId, datasheetName } } as const;

    if (datasheetQuery.isPending) {
        return <LoadingText withSpinnerIcon={true} as="p" />;
    }

    if (datasheetQuery.isError) {
        return <Alert severity="error" title={t("load_error")} description={getApiErrorMessage(datasheetQuery.error)} small />;
    }

    return (
        <>
            {hasIntegrationInProgress && (
                <Notice className={fr.cx("fr-mb-2w")} title={t("loading_notice.title")} description={t("loading_notice.description")} isClosable />
            )}

            <DatasheetViewTab>
                <h2 className={fr.cx("fr-h5", "fr-mb-5w")}>{t("title")}</h2>

                <DatasetAddBanners />

                {deleteUpload.isError && (
                    <Alert
                        className={fr.cx("fr-mt-2w")}
                        severity="error"
                        title={t("delete_error")}
                        description={getApiErrorMessage(deleteUpload.error)}
                        small
                    />
                )}

                {rows.length === 0 ? (
                    <div className={classes.empty}>
                        {canAddData ? <Button linkProps={addDataLink}>{t("add")}</Button> : <p className={fr.cx("fr-m-0")}>{t("no_data")}</p>}
                    </div>
                ) : (
                    <>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-mt-4w")}>
                            <div className={fr.cx("fr-col")}>
                                <SegmentedControl
                                    hideLegend
                                    legend={t("filter_legend")}
                                    name="dataset-type-filter"
                                    segments={[segment(FILTERS[0]), segment(FILTERS[1]), segment(FILTERS[2]), segment(FILTERS[3])]}
                                />
                            </div>
                            {canAddData && (
                                <Button iconId="fr-icon-add-line" linkProps={addDataLink}>
                                    {t("add")}
                                </Button>
                            )}
                        </div>

                        <p className={fr.cx("fr-text--sm", "fr-mt-3w", "fr-mb-1w")}>{t("results", { count: filteredRows.length })}</p>

                        <Table
                            caption={t("caption")}
                            noCaption
                            fixed
                            headers={[t("column.name"), t("column.type"), t("column.creation"), t("column.status"), t("column.action")]}
                            data={filteredRows.map((row) => [
                                <span key={`name-${row.id}`} title={row.name}>
                                    {row.name}
                                </span>,
                                <Badge
                                    key={`type-${row.id}`}
                                    small
                                    noIcon
                                    className={fr.cx(row.type === "ROK4-PYRAMID-RASTER" ? "fr-badge--purple-glycine" : "fr-badge--blue-cumulus")}
                                >
                                    {row.type === "ROK4-PYRAMID-RASTER" ? t("type.raster") : t("type.vector")}
                                </Badge>,
                                row.creation ? formatDateFromISO(row.creation) : "",
                                row.status,
                                row.action,
                            ])}
                        />
                    </>
                )}
            </DatasheetViewTab>

            {deleteUpload.isPending && (
                <Wait>
                    <LoadingText as="h6" message={t("deleting")} withSpinnerIcon={true} />
                </Wait>
            )}
        </>
    );
}

const useStyles = tss.withName({ DatasetTabNext }).create({
    empty: {
        display: "flex",
        justifyContent: "center",
        marginTop: fr.spacing("4w"),
        padding: `${fr.spacing("8w")} 0`,
        border: `1px dashed ${fr.colors.decisions.border.default.grey.default}`,
    },
});

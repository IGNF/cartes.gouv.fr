import { fr } from "@codegouvfr/react-dsfr";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { JSX, lazy, Suspense, useMemo } from "react";
import { createPortal } from "react-dom";

import { DatasheetDetailed, Metadata, Service } from "@/@types/app";
import DatasheetMain from "@/components/Layout/Datasheet/DatasheetMain";
import TertiaryNavigation from "@/components/Layout/TertiaryNavigation";
import LoadingIcon from "@/components/Utils/LoadingIcon";
import LoadingText from "@/components/Utils/LoadingText";
import Wait from "@/components/Utils/Wait";
import api from "@/entrepot/api";
import { blockingProcessingStatuses } from "@/hooks/queries/useStoredDataUseProcessings";
import useCatalogueDatasheetUrl from "@/hooks/useCatalogueDatasheetUrl";
import { useTranslation } from "@/i18n";
import RQKeys from "@/modules/entrepot/RQKeys";
import { CartesApiException } from "@/modules/jsonFetch";
import { delta } from "@/utils";
import { routes } from "@/router/router";
import { useStyles } from "tss-react";
import DatasheetHeader from "./DatasheetHeader";

const DescriptionTab = lazy(() => import("../DescriptionTab/DescriptionTab"));

const publishConfirmModal = createModal({
    id: "datasheet-next-publish-confirm-modal",
    isOpenedByDefault: false,
});

const unpublishConfirmModal = createModal({
    id: "datasheet-next-unpublish-confirm-modal",
    isOpenedByDefault: false,
});

const deleteConfirmModal = createModal({
    id: "datasheet-next-delete-confirm-modal",
    isOpenedByDefault: false,
});

export enum DatasheetViewActiveTabEnum {
    Description = "description",
    Preview = "preview",
    Annexes = "annexes",
    Dataset = "dataset",
    Wfs = "wfs",
    Wms = "wms",
    Tms = "tms",
    Wmts = "wmts",
}

const tabs: Array<{ label: string; value: DatasheetViewActiveTabEnum }> = [
    { label: "Description", value: DatasheetViewActiveTabEnum.Description },
    { label: "Aperçu", value: DatasheetViewActiveTabEnum.Preview },
    { label: "Annexes", value: DatasheetViewActiveTabEnum.Annexes },
    { label: "Données", value: DatasheetViewActiveTabEnum.Dataset },
    { label: "Flux WFS", value: DatasheetViewActiveTabEnum.Wfs },
    { label: "Flux WMS", value: DatasheetViewActiveTabEnum.Wms },
    { label: "Flux TMS", value: DatasheetViewActiveTabEnum.Tms },
    { label: "Flux WMTS", value: DatasheetViewActiveTabEnum.Wmts },
];

type DatasheetViewProps = {
    datastoreId: string;
    datasheetName: string;
    activeTab: string;
};

export default function DatasheetViewNext(props: DatasheetViewProps) {
    const { datastoreId, datasheetName, activeTab = DatasheetViewActiveTabEnum.Description } = props;

    const { t: tCommon } = useTranslation("Common");

    const queryClient = useQueryClient();

    // ----- Mutation de suppression (déclarée avant les requêtes pour contrôler `enabled`) -----

    const datasheetDeleteMutation = useMutation<null, CartesApiException>({
        mutationFn: () => api.datasheet.remove(datastoreId, datasheetName),
        onSuccess: () => {
            queryClient.setQueryData<DatasheetDetailed[]>(RQKeys.datastore_datasheet_list(datastoreId), (list = []) =>
                list.filter((d) => d.name !== datasheetName)
            );
            queryClient.invalidateQueries({ queryKey: RQKeys.datastore_datasheet_list(datastoreId) });
            routes.datasheet_list({ datastoreId }).push();
        },
    });

    // ----- Requêtes -----

    const datasheetQuery = useQuery<DatasheetDetailed, CartesApiException>({
        queryKey: RQKeys.datastore_datasheet(datastoreId, datasheetName),
        queryFn: ({ signal }) => api.datasheet.get(datastoreId, datasheetName, { signal }),
        staleTime: 60000,
        retry: false,
        enabled: !datasheetDeleteMutation.isPending,
    });
    const datasheet = datasheetQuery.data;

    const metadataQuery = useQuery<Metadata, CartesApiException>({
        queryKey: RQKeys.datastore_datasheet_metadata(datastoreId, datasheetName),
        queryFn: ({ signal }) => api.metadata.getByDatasheetName(datastoreId, datasheetName, { signal }),
        staleTime: 60000,
        retry: false,
        enabled: !datasheetDeleteMutation.isPending,
    });

    const serviceListQuery = useQuery<Service[], CartesApiException>({
        queryKey: RQKeys.datastore_datasheet_service_list(datastoreId, datasheetName),
        queryFn: ({ signal }) => api.datasheet.getServices(datastoreId, datasheetName, { signal }),
        staleTime: 60000,
        retry: false,
        enabled: !datasheetDeleteMutation.isPending,
    });

    const documentsListQuery = useQuery({
        queryKey: RQKeys.datastore_datasheet_documents_list(datastoreId, datasheetName),
        queryFn: ({ signal }) => api.datasheetDocument.getList(datastoreId, datasheetName, { signal }),
        staleTime: 120000,
        enabled: !datasheetDeleteMutation.isPending,
    });

    // Identifiants des données stockées (pour la vérification de traitements en cours)
    const storedDataIds = useMemo(
        () => [
            ...(datasheet?.vector_db_list?.map((v) => v._id) ?? []),
            ...(datasheet?.pyramid_vector_list?.map((p) => p._id) ?? []),
            ...(datasheet?.pyramid_raster_list?.map((p) => p._id) ?? []),
        ],
        [datasheet]
    );

    const isDeleteModalOpen = useIsModalOpen(deleteConfirmModal);
    const processingExecutionsQuery = useQueries({
        queries: storedDataIds.map((storedDataId) => {
            const queryParams = { input_stored_data: storedDataId };
            return {
                queryKey: RQKeys.datastore_processing_execution_list(datastoreId, { ...queryParams, statuses: blockingProcessingStatuses }),
                queryFn: async ({ signal }: { signal?: AbortSignal }) => {
                    const executions = await api.processing.getExecutionList(datastoreId, queryParams, { signal });
                    return executions.filter((execution) => blockingProcessingStatuses.includes(execution.status));
                },
                staleTime: delta.minutes(10),
                enabled: isDeleteModalOpen,
            };
        }),
    });

    const { catalogueDatasheetUrl } = useCatalogueDatasheetUrl(datastoreId, datasheetName);

    const isPublished = useMemo(
        () => metadataQuery.data?.endpoints?.length !== undefined && metadataQuery.data?.endpoints?.length > 0,
        [metadataQuery.data?.endpoints?.length]
    );

    const metadataId = metadataQuery.data?._id;

    // ----- Mutations -----

    const publishMutation = useMutation<null, CartesApiException>({
        mutationFn: () => api.metadata.publish(datastoreId, metadataId!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: RQKeys.datastore_datasheet_metadata(datastoreId, datasheetName) });
        },
    });

    const unpublishMutation = useMutation<null, CartesApiException>({
        mutationFn: () => api.metadata.unpublish(datastoreId, metadataId!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: RQKeys.datastore_datasheet_metadata(datastoreId, datasheetName) });
        },
    });

    const isMutationPending = publishMutation.isPending || unpublishMutation.isPending || datasheetDeleteMutation.isPending;

    const pendingMessage = (() => {
        if (publishMutation.isPending) return "Publication en cours ...";
        if (unpublishMutation.isPending) return "Dépublication en cours ...";
        if (datasheetDeleteMutation.isPending) return `Suppression de la fiche de données ${datasheetName} en cours ...`;
        return "";
    })();

    const { css, cx } = useStyles();

    return (
        <>
            <DatasheetMain
                title={`Données ${datasheetName}`}
                header={
                    <>
                        <DatasheetHeader
                            name={datasheetName}
                            thumbnailUrl={datasheet?.thumbnail?.url}
                            catalogLink={catalogueDatasheetUrl}
                            published={isPublished}
                            loading={datasheetQuery.isLoading || metadataQuery.isLoading}
                            onPublish={() => publishConfirmModal.open()}
                            onUnpublish={() => unpublishConfirmModal.open()}
                            onDelete={() => deleteConfirmModal.open()}
                        />

                        <TertiaryNavigation
                            items={tabs.map((tab) => ({
                                text: tab.label,
                                linkProps: routes.datastore_datasheet_view_next({ datastoreId, datasheetName, activeTab: tab.value }).link,
                                isActive: activeTab === tab.value,
                            }))}
                        />
                    </>
                }
                content={
                    <div
                        className={cx(
                            fr.cx("fr-container--fluid", "fr-py-10v"),
                            css({
                                backgroundColor: fr.colors.decisions.background.alt.grey.default,
                            })
                        )}
                    >
                        <div className={cx(fr.cx("fr-container"))}>
                            <Suspense fallback={<LoadingText withSpinnerIcon={true} as="p" />}>
                                {(() => {
                                    const tabContent: Record<DatasheetViewActiveTabEnum, JSX.Element> = {
                                        [DatasheetViewActiveTabEnum.Description]: <DescriptionTab datastoreId={datastoreId} datasheetName={datasheetName} />,
                                        [DatasheetViewActiveTabEnum.Preview]: <p>Aperçu</p>,
                                        [DatasheetViewActiveTabEnum.Annexes]: <p>Annexes</p>,
                                        [DatasheetViewActiveTabEnum.Dataset]: <p>Données</p>,
                                        [DatasheetViewActiveTabEnum.Wfs]: <p>Flux WFS</p>,
                                        [DatasheetViewActiveTabEnum.Wms]: <p>Flux WMS</p>,
                                        [DatasheetViewActiveTabEnum.Tms]: <p>Flux TMS</p>,
                                        [DatasheetViewActiveTabEnum.Wmts]: <p>Flux WMTS</p>,
                                    };

                                    return tabContent[activeTab as DatasheetViewActiveTabEnum] ?? <p>Onglet inconnu</p>;
                                })()}
                            </Suspense>
                        </div>
                    </div>
                }
            />

            {/* Overlay de chargement */}
            {isMutationPending && (
                <Wait>
                    <div className={fr.cx("fr-container")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                            <div className={fr.cx("fr-col-2")}>
                                <LoadingIcon />
                            </div>
                            <div className={fr.cx("fr-col-10")}>
                                <h6 className={fr.cx("fr-h6", "fr-m-0")}>{pendingMessage}</h6>
                            </div>
                        </div>
                    </div>
                </Wait>
            )}

            {/* Modale : Publier */}
            {createPortal(
                <publishConfirmModal.Component
                    title="Publier la fiche de donnée"
                    buttons={[
                        {
                            children: tCommon("cancel"),
                            doClosesModal: true,
                            priority: "secondary",
                        },
                        {
                            children: "Publier",
                            onClick: () => publishMutation.mutate(),
                            priority: "primary",
                            disabled: !metadataId,
                        },
                    ]}
                >
                    <p>
                        Votre fiche de données sera visible dans le catalogue de cartes.gouv.fr via <strong>Rechercher une donnée</strong>. Les jeux de données
                        et flux que vous avez rendus publics seront accessibles à tous.
                    </p>
                    <p>Chaque modification que vous apportez à votre fiche sera publiée instantanément.</p>
                </publishConfirmModal.Component>,
                document.body
            )}

            {/* Modale : Dépublier */}
            {createPortal(
                <unpublishConfirmModal.Component
                    title="Dépublier la fiche de donnée"
                    buttons={[
                        {
                            children: tCommon("cancel"),
                            doClosesModal: true,
                            priority: "secondary",
                        },
                        {
                            children: "Dépublier",
                            onClick: () => unpublishMutation.mutate(),
                            priority: "primary",
                            disabled: !metadataId,
                        },
                    ]}
                >
                    <p>Votre fiche de données ne sera plus visible dans le catalogue de cartes.gouv.fr.</p>
                </unpublishConfirmModal.Component>,
                document.body
            )}

            {/* Modale : Supprimer */}
            {createPortal(
                <deleteConfirmModal.Component
                    title={`Êtes-vous sûr de supprimer la fiche de données ${datasheetName} ?`}
                    buttons={[
                        {
                            children: tCommon("cancel"),
                            doClosesModal: true,
                            priority: "secondary",
                        },
                        {
                            children: tCommon("delete"),
                            onClick: () => datasheetDeleteMutation.mutate(),
                            priority: "primary",
                            disabled:
                                datasheetQuery.isFetching ||
                                metadataQuery.isFetching ||
                                documentsListQuery.isFetching ||
                                processingExecutionsQuery.some((q) => q.isFetching),
                        },
                    ]}
                >
                    {datasheetQuery.isFetching ||
                    metadataQuery.isFetching ||
                    documentsListQuery.isFetching ||
                    processingExecutionsQuery.some((q) => q.isFetching) ? (
                        <LoadingText withSpinnerIcon={true} as="p" />
                    ) : (
                        <>
                            <p className={fr.cx("fr-mb-1v")}>Les éléments suivants seront supprimés :</p>
                            <ul>
                                {datasheet?.vector_db_list?.length ? <li>{datasheet.vector_db_list.length} base(s) de données</li> : null}
                                {datasheet?.pyramid_vector_list?.length ? (
                                    <li>{datasheet.pyramid_vector_list.length} pyramide(s) de tuiles vectorielles</li>
                                ) : null}
                                {datasheet?.pyramid_raster_list?.length ? <li>{datasheet.pyramid_raster_list.length} pyramide(s) de tuiles raster</li> : null}
                                {serviceListQuery.data?.length ? <li>{serviceListQuery.data.length} service(s) publié(s)</li> : null}
                                {datasheet?.upload_list?.length ? <li>{datasheet.upload_list.length} livraison(s)</li> : null}
                                {metadataQuery.data && <li>La métadonnée associée ({metadataQuery.data.file_identifier})</li>}
                                {documentsListQuery.data?.length ? <li>{documentsListQuery.data.length} document(s) associé(s)</li> : null}
                            </ul>

                            {processingExecutionsQuery.filter((q) => q.data !== undefined && q.data.length > 0).flatMap((q) => q.data).length > 0 && (
                                <p>Un ou plusieurs traitements avec au moins un de ces jeux de données en entrée sont en cours et seront annulés.</p>
                            )}
                        </>
                    )}
                </deleteConfirmModal.Component>,
                document.body
            )}
        </>
    );
}

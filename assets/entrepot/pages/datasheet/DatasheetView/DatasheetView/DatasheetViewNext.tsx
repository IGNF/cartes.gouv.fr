import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { lazy, ReactNode, Suspense, useMemo } from "react";
import { createPortal } from "react-dom";
import { tss } from "tss-react";

import type { Datasheet, DatasheetDetailed, Metadata, Service } from "@/@types/app";
import { CommunityMemberDtoRightsEnum } from "@/@types/entrepot";
import Main from "@/components/Layout/Main";
import TertiaryNavigation from "@/components/Layout/TertiaryNavigation";
import LoadingText from "@/components/Utils/LoadingText";
import Wait from "@/components/Utils/Wait";
import api from "@/entrepot/api";
import { blockingProcessingStatuses } from "@/hooks/queries/useStoredDataUseProcessings";
import useCatalogueDatasheetUrl from "@/hooks/useCatalogueDatasheetUrl";
import useCommunityRights from "@/hooks/useCommunityRights";
import { useTranslation } from "@/i18n";
import { getApiErrorMessage } from "@/modules/apiError";
import { datasheetMetadataQueryOptions } from "@/hooks/queries/datasheetMetadataQueryOptions";
import RQKeys from "@/modules/entrepot/RQKeys";
import { type ApiError } from "@/modules/jsonFetch";
import { searchAwareActiveOptions } from "@/router/AppLink";
import { delta } from "@/utils";
import DatasheetViewTab from "../../DatasheetViewTab";
import DatasheetHeader from "./DatasheetHeader";
import { DatasheetViewActiveTabEnum } from "./types";

const DescriptionTab = lazy(() => import("../DescriptionTab/DescriptionTab"));
const DatasetTabNext = lazy(() => import("../DatasetTabNext/DatasetTabNext"));
const ServicesListTab = lazy(() => import("../ServiceListTab/ServicesListTab"));

export const DATASHEET_VIEW_NEXT_TABS = [
    DatasheetViewActiveTabEnum.Description,
    DatasheetViewActiveTabEnum.Dataset,
    DatasheetViewActiveTabEnum.Services,
] as const;

const publishModal = createModal({ id: "datasheet-publish-modal", isOpenedByDefault: false });
const unpublishModal = createModal({ id: "datasheet-unpublish-modal", isOpenedByDefault: false });
const deleteModal = createModal({ id: "datasheet-delete-modal", isOpenedByDefault: false });

type DatasheetViewNextProps = {
    datastoreId: string;
    datasheetName: string;
    activeTab: DatasheetViewActiveTabEnum;
};

export default function DatasheetViewNext({ datastoreId, datasheetName, activeTab }: DatasheetViewNextProps) {
    const { t } = useTranslation("DatasheetViewNext");
    const { t: tView } = useTranslation("DatasheetView");
    const { t: tCommon } = useTranslation("Common");
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { classes } = useStyles();

    const { userRights, isSupervisor } = useCommunityRights();
    const hasRights = (...rights: CommunityMemberDtoRightsEnum[]) => isSupervisor || rights.every((right) => userRights?.includes(right));
    const canBroadcast = hasRights(CommunityMemberDtoRightsEnum.BROADCAST);
    // même règle que l’ancienne fiche
    const canDelete = hasRights(
        CommunityMemberDtoRightsEnum.ANNEX,
        CommunityMemberDtoRightsEnum.UPLOAD,
        CommunityMemberDtoRightsEnum.PROCESSING,
        CommunityMemberDtoRightsEnum.BROADCAST
    );

    const deleteMutation = useMutation<null, ApiError>({
        mutationFn: () => api.datasheet.remove(datastoreId, datasheetName),
        onSuccess() {
            queryClient.setQueryData<Datasheet[]>(RQKeys.datastore_datasheet_list(datastoreId), (list) =>
                list?.filter((datasheet) => datasheet.name !== datasheetName)
            );
            void queryClient.invalidateQueries({ queryKey: RQKeys.datastore_datasheet_list(datastoreId) });
            void navigate({ to: "/tableau-de-bord/entrepots/$datastoreId/donnees", params: { datastoreId } });
        },
    });
    // plus de relecture pendant la suppression : la fiche disparaît
    const enabled = !deleteMutation.isPending && !deleteMutation.isSuccess;

    const datasheetQuery = useQuery<DatasheetDetailed, ApiError>({
        queryKey: RQKeys.datastore_datasheet(datastoreId, datasheetName),
        queryFn: ({ signal }) => api.datasheet.get(datastoreId, datasheetName, { signal }),
        staleTime: 60000,
        retry: false,
        enabled,
    });

    const metadataQuery = useQuery({ ...datasheetMetadataQueryOptions(datastoreId, datasheetName), enabled });

    const serviceListQuery = useQuery<Service[], ApiError>({
        queryKey: RQKeys.datastore_datasheet_service_list(datastoreId, datasheetName),
        queryFn: ({ signal }) => api.datasheet.getServices(datastoreId, datasheetName, { signal }),
        staleTime: 60000,
        retry: false,
        enabled,
    });

    const isDeleteModalOpen = useIsModalOpen(deleteModal);

    const documentsListQuery = useQuery({
        queryKey: RQKeys.datastore_datasheet_documents_list(datastoreId, datasheetName),
        queryFn: ({ signal }) => api.datasheetDocument.getList(datastoreId, datasheetName, { signal }),
        staleTime: 120000,
        enabled: enabled && isDeleteModalOpen,
    });

    const storedDataIds = useMemo(
        () =>
            [
                ...(datasheetQuery.data?.vector_db_list ?? []),
                ...(datasheetQuery.data?.pyramid_vector_list ?? []),
                ...(datasheetQuery.data?.pyramid_raster_list ?? []),
            ].map((storedData) => storedData._id),
        [datasheetQuery.data]
    );

    const processingExecutionsQueries = useQueries({
        queries: storedDataIds.map((storedDataId) => {
            const queryParams = { input_stored_data: storedDataId };
            return {
                queryKey: RQKeys.datastore_processing_execution_list(datastoreId, { ...queryParams, statuses: blockingProcessingStatuses }),
                queryFn: async ({ signal }: { signal: AbortSignal }) => {
                    const executions = await api.processing.getExecutionList(datastoreId, queryParams, { signal });
                    return executions.filter((execution) => blockingProcessingStatuses.includes(execution.status));
                },
                staleTime: delta.minutes(10),
                enabled: isDeleteModalOpen,
            };
        }),
    });

    const metadata = metadataQuery.data;
    const published = (metadata?.endpoints?.length ?? 0) > 0;
    const catalogueUrl = useCatalogueDatasheetUrl(datastoreId, metadata);

    // pas de relecture : l’Entrepôt peut renvoyer l’ancien état de publication quelques secondes
    const setEndpoints = (endpoints: Metadata["endpoints"]) =>
        queryClient.setQueryData<Metadata>(RQKeys.datastore_datasheet_metadata(datastoreId, datasheetName), (current) => current && { ...current, endpoints });

    const publishMutation = useMutation<Metadata["endpoints"], ApiError>({
        mutationFn: () => api.datasheet.publish(datastoreId, datasheetName),
        onSuccess: (endpoints) => setEndpoints(endpoints),
    });

    const unpublishMutation = useMutation<null, ApiError>({
        mutationFn: () => api.datasheet.unpublish(datastoreId, datasheetName),
        onSuccess: () => setEndpoints([]),
    });

    const pendingMessage = publishMutation.isPending
        ? t("publishing")
        : unpublishMutation.isPending
          ? t("unpublishing")
          : deleteMutation.isPending
            ? tView("datasheet.being_removed", { datasheetName })
            : undefined;

    const mutationError: [string, ApiError] | undefined = publishMutation.error
        ? [t("publish_error"), publishMutation.error]
        : unpublishMutation.error
          ? [t("unpublish_error"), unpublishMutation.error]
          : deleteMutation.error
            ? [t("delete_error"), deleteMutation.error]
            : undefined;

    const deleteModalLoading =
        datasheetQuery.isFetching || metadataQuery.isFetching || documentsListQuery.isFetching || processingExecutionsQueries.some((query) => query.isFetching);
    const datasheet = datasheetQuery.data;

    const tabContent: Record<(typeof DATASHEET_VIEW_NEXT_TABS)[number], ReactNode> = {
        [DatasheetViewActiveTabEnum.Description]: (
            <DatasheetViewTab>
                <DescriptionTab datastoreId={datastoreId} datasheetName={datasheetName} metadataQuery={metadataQuery} />
            </DatasheetViewTab>
        ),
        [DatasheetViewActiveTabEnum.Dataset]: (
            <DatasetTabNext
                datastoreId={datastoreId}
                datasheetName={datasheetName}
                hasMetadata={metadataQuery.isSuccess ? true : metadataQuery.error?.status === 404 ? false : undefined}
                onDeleteDatasheet={() => deleteModal.open()}
            />
        ),
        // ancien onglet jusqu’au ticket 04
        [DatasheetViewActiveTabEnum.Services]: datasheet && (
            <DatasheetViewTab>
                <ServicesListTab datastoreId={datastoreId} datasheet={datasheet} servicesListQuery={serviceListQuery} />
            </DatasheetViewTab>
        ),
    };

    return (
        <Main
            title={datasheetName}
            breadcrumbSeparator
            fullWidthContent={
                <div className={classes.tabBackground}>
                    <div className={fr.cx("fr-container", "fr-py-5w")}>
                        <Suspense fallback={<LoadingText withSpinnerIcon={true} as="p" />}>{tabContent[activeTab as keyof typeof tabContent]}</Suspense>
                    </div>
                </div>
            }
        >
            {datasheetQuery.isError && (
                <Alert className={fr.cx("fr-mt-4w")} severity="error" title={t("load_error")} description={getApiErrorMessage(datasheetQuery.error)} small />
            )}
            {mutationError && (
                <Alert className={fr.cx("fr-mt-4w")} severity="error" title={mutationError[0]} description={getApiErrorMessage(mutationError[1])} small />
            )}

            <DatasheetHeader
                name={datasheetName}
                thumbnailUrl={datasheet?.thumbnail?.url}
                catalogueUrl={catalogueUrl}
                published={published}
                canPublish={metadata !== undefined}
                canBroadcast={canBroadcast}
                canDelete={canDelete}
                onPublish={() => publishModal.open()}
                onUnpublish={() => unpublishModal.open()}
                onDelete={() => deleteModal.open()}
            />

            <TertiaryNavigation
                items={DATASHEET_VIEW_NEXT_TABS.map((tab) => ({
                    text: t(`tab.${tab}` as "tab.description" | "tab.dataset" | "tab.services"),
                    linkProps: { to: ".", search: { activeTab: tab }, replace: true, activeOptions: searchAwareActiveOptions },
                    isActive: activeTab === tab,
                }))}
            />

            {pendingMessage && (
                <Wait>
                    <LoadingText as="h6" message={pendingMessage} withSpinnerIcon={true} />
                </Wait>
            )}

            {createPortal(
                <publishModal.Component
                    title={t("publish_modal.title")}
                    buttons={[
                        { children: tCommon("cancel"), doClosesModal: true, priority: "secondary" },
                        { children: t("publish"), onClick: () => publishMutation.mutate() },
                    ]}
                >
                    <p>{t("publish_modal.text")}</p>
                    <p>{t("publish_modal.live_updates")}</p>
                </publishModal.Component>,
                document.body
            )}

            {createPortal(
                <unpublishModal.Component
                    title={t("unpublish_modal.title")}
                    buttons={[
                        { children: tCommon("cancel"), doClosesModal: true, priority: "secondary" },
                        { children: t("unpublish"), onClick: () => unpublishMutation.mutate() },
                    ]}
                >
                    <p>{t("unpublish_modal.text")}</p>
                </unpublishModal.Component>,
                document.body
            )}

            {createPortal(
                <deleteModal.Component
                    title={tView("datasheet_confirm_delete_modal.title", { datasheetName })}
                    buttons={[
                        { children: tCommon("cancel"), doClosesModal: true, priority: "secondary" },
                        { children: tCommon("delete"), onClick: () => deleteMutation.mutate(), disabled: deleteModalLoading },
                    ]}
                >
                    {deleteModalLoading ? (
                        <LoadingText withSpinnerIcon={true} as="p" />
                    ) : (
                        <>
                            <p className={fr.cx("fr-mb-1v")}>{tView("datasheet_confirm_delete_modal.text")}</p>
                            <ul>
                                {datasheet?.vector_db_list?.length ? <li>{t("delete_modal.vector_db", { count: datasheet.vector_db_list.length })}</li> : null}
                                {datasheet?.pyramid_vector_list?.length ? (
                                    <li>{t("delete_modal.pyramid_vector", { count: datasheet.pyramid_vector_list.length })}</li>
                                ) : null}
                                {datasheet?.pyramid_raster_list?.length ? (
                                    <li>{t("delete_modal.pyramid_raster", { count: datasheet.pyramid_raster_list.length })}</li>
                                ) : null}
                                {serviceListQuery.data?.length ? <li>{t("delete_modal.services", { count: serviceListQuery.data.length })}</li> : null}
                                {datasheet?.upload_list?.length ? <li>{t("delete_modal.uploads", { count: datasheet.upload_list.length })}</li> : null}
                                {metadata && <li>{t("delete_modal.metadata", { fileIdentifier: metadata.file_identifier })}</li>}
                                {documentsListQuery.data?.length ? <li>{t("delete_modal.documents", { count: documentsListQuery.data.length })}</li> : null}
                            </ul>
                            {processingExecutionsQueries.some((query) => (query.data?.length ?? 0) > 0) && (
                                <p>{tView("processing_in_progress_deletion_warning")}</p>
                            )}
                        </>
                    )}
                </deleteModal.Component>,
                document.body
            )}
        </Main>
    );
}

const useStyles = tss.withName({ DatasheetViewNext }).create({
    tabBackground: {
        backgroundColor: fr.colors.decisions.background.alt.grey.default,
    },
});

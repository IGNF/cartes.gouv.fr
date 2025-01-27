import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import { ButtonsGroup } from "@codegouvfr/react-dsfr/ButtonsGroup";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { Tabs } from "@codegouvfr/react-dsfr/Tabs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FC } from "react";
import { createPortal } from "react-dom";
import { symToStr } from "tsafe/symToStr";

import { type Datasheet, type DatasheetDetailed, type Metadata } from "../../../../../@types/app";
import DatastoreLayout from "../../../../../components/Layout/DatastoreLayout";
import LoadingIcon from "../../../../../components/Utils/LoadingIcon";
import Wait from "../../../../../components/Utils/Wait";
import { useTranslation } from "../../../../../i18n/i18n";
import RQKeys from "../../../../../modules/entrepot/RQKeys";
import { type CartesApiException } from "../../../../../modules/jsonFetch";
import { routes, useRoute } from "../../../../../router/router";
import api from "../../../../api";
import DatasetListTab from "../DatasetListTab/DatasetListTab";
import DatasheetThumbnail from "../DatasheetThumbnail";
import DocumentsTab from "../DocumentsTab/DocumentsTab";
import MetadataTab from "../MetadataTab/MetadataTab";
import ServicesListTab from "../ServiceListTab/ServicesListTab";

const deleteDataConfirmModal = createModal({
    id: "delete-data-confirm-modal",
    isOpenedByDefault: false,
});

export enum DatasheetViewActiveTabEnum {
    Metadata = "metadata",
    Dataset = "dataset",
    Services = "services",
    Documents = "documents",
}

export const deleteUploadConfirmModal = createModal({
    id: "delete-upload-confirm-modal",
    isOpenedByDefault: false,
});

type DatasheetViewProps = {
    datastoreId: string;
    datasheetName: string;
};

const DatasheetView: FC<DatasheetViewProps> = ({ datastoreId, datasheetName }) => {
    const { t: tCommon } = useTranslation("Common");
    const { t } = useTranslation({ DatasheetView });

    const route = useRoute();

    const activeTab: DatasheetViewActiveTabEnum = Object.values(DatasheetViewActiveTabEnum).includes(route.params?.["activeTab"])
        ? route.params?.["activeTab"]
        : DatasheetViewActiveTabEnum.Metadata;

    const queryClient = useQueryClient();

    const datasheetDeleteMutation = useMutation<null, CartesApiException>({
        mutationFn: () => api.datasheet.remove(datastoreId, datasheetName),
        onSuccess() {
            queryClient.setQueryData<Datasheet[]>(RQKeys.datastore_datasheet_list(datastoreId), (datasheetList = []) => {
                return datasheetList.filter((datasheet) => datasheet.name !== datasheetName);
            });
            queryClient.invalidateQueries({ queryKey: RQKeys.datastore_datasheet_list(datastoreId) });

            routes.datasheet_list({ datastoreId }).push();
        },
    });

    const datasheetQuery = useQuery<DatasheetDetailed, CartesApiException>({
        queryKey: RQKeys.datastore_datasheet(datastoreId, datasheetName),
        queryFn: ({ signal }) => api.datasheet.get(datastoreId, datasheetName, { signal }),
        staleTime: 60000,
        refetchInterval: 60000,
        retry: false,
        enabled: !datasheetDeleteMutation.isPending,
    });

    const metadataQuery = useQuery<Metadata, CartesApiException>({
        queryKey: RQKeys.datastore_datasheet_metadata(datastoreId, datasheetName),
        queryFn: ({ signal }) => api.metadata.getByDatasheetName(datastoreId, datasheetName, { signal }),
        enabled: !datasheetDeleteMutation.isPending,
        staleTime: 60000,
        retry: false,
    });

    const documentsListQuery = useQuery({
        queryKey: RQKeys.datastore_datasheet_documents_list(datastoreId, datasheetName),
        queryFn: ({ signal }) => api.datasheetDocument.getList(datastoreId, datasheetName, { signal }),
        staleTime: 120000,
        enabled: !datasheetDeleteMutation.isPending,
    });

    return (
        <DatastoreLayout datastoreId={datastoreId} documentTitle={`Données ${datasheetName}`}>
            <div className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-mb-4w")}>
                <Button
                    iconId="fr-icon-arrow-left-s-line"
                    priority="tertiary no outline"
                    linkProps={routes.datasheet_list({ datastoreId }).link}
                    title={t("datasheet.back_to_list")}
                    size="large"
                />
                <h1 className={fr.cx("fr-m-0", "fr-mr-2w")}>{datasheetName}</h1>
                {datasheetQuery?.data?.nb_publications !== undefined && (
                    <Badge noIcon={true} severity="info" className={fr.cx("fr-mr-2w")}>
                        {datasheetQuery?.data?.nb_publications > 0 ? tCommon("published") : tCommon("not_published")}
                    </Badge>
                )}
                {(datasheetQuery.isFetching || metadataQuery.isFetching || documentsListQuery.isFetching) && <LoadingIcon largeIcon={true} />}
            </div>

            {datasheetQuery.error && (
                <div className={fr.cx("fr-grid-row", "fr-mb-4w")}>
                    <div className={fr.cx("fr-col")}>
                        <Alert
                            severity="error"
                            closable={true}
                            title={datasheetQuery.error.message}
                            description={<Button linkProps={routes.datasheet_list({ datastoreId }).link}>{t("datasheet.back_to_list")}</Button>}
                            onClose={datasheetQuery.refetch}
                        />
                    </div>
                </div>
            )}

            {datasheetDeleteMutation.error && (
                <div className={fr.cx("fr-grid-row", "fr-mb-4w")}>
                    <div className={fr.cx("fr-col")}>
                        <Alert severity="error" closable={true} title={datasheetDeleteMutation.error.message} />
                    </div>
                </div>
            )}

            {datasheetQuery.data !== undefined && (
                <>
                    <div className={fr.cx("fr-grid-row", "fr-mb-4w")}>
                        <div className={fr.cx("fr-col-2")}>
                            <DatasheetThumbnail datastoreId={datastoreId} datasheetName={datasheetName} datasheet={datasheetQuery.data} />
                        </div>
                        <div className={fr.cx("fr-col")}>
                            {/* TODO : désactivé car on n'a pas ces infos */}
                            <p className={fr.cx("fr-mb-2v")}>{/* <strong>Création de la fiche de données : </strong>13 Mar. 2023 */}</p>
                            <p className={fr.cx("fr-mb-2v")}>{/* <strong>Mise à jour : </strong>17 Mar. 2023 */}</p>
                        </div>
                        <div className={fr.cx("fr-col-3")}>
                            <ButtonsGroup
                                buttons={[
                                    {
                                        children: t("datasheet.remove"),
                                        onClick: () => deleteDataConfirmModal.open(),
                                        iconId: "fr-icon-delete-fill",
                                        priority: "secondary",
                                    },
                                ]}
                            />
                        </div>
                    </div>

                    <div className={fr.cx("fr-grid-row")}>
                        <div className={fr.cx("fr-col-12")}>
                            <Tabs
                                tabs={[
                                    {
                                        label: t("tab_label.metadata"),
                                        tabId: DatasheetViewActiveTabEnum.Metadata,
                                    },
                                    {
                                        label: t("tab_label.datasets", {
                                            num:
                                                (datasheetQuery.data?.vector_db_list?.length || 0) +
                                                (datasheetQuery.data?.pyramid_vector_list?.length || 0) +
                                                (datasheetQuery.data?.pyramid_raster_list?.length || 0),
                                        }),
                                        tabId: DatasheetViewActiveTabEnum.Dataset,
                                    },
                                    {
                                        label: t("tab_label.services", { num: datasheetQuery.data.service_list?.length || 0 }),
                                        tabId: DatasheetViewActiveTabEnum.Services,
                                    },
                                    {
                                        label: t("tab_label.documents", { num: documentsListQuery.data?.length ?? 0 }),
                                        tabId: DatasheetViewActiveTabEnum.Documents,
                                    },
                                ]}
                                selectedTabId={activeTab}
                                onTabChange={(activeTab) => {
                                    routes.datastore_datasheet_view({ datastoreId, datasheetName, activeTab }).replace();
                                }}
                            >
                                {(() => {
                                    switch (activeTab) {
                                        case DatasheetViewActiveTabEnum.Metadata:
                                            return <MetadataTab datastoreId={datastoreId} metadataQuery={metadataQuery} />;

                                        case DatasheetViewActiveTabEnum.Dataset:
                                            return <DatasetListTab datastoreId={datastoreId} datasheet={datasheetQuery.data} />;

                                        case DatasheetViewActiveTabEnum.Services:
                                            return (
                                                <ServicesListTab
                                                    datastoreId={datastoreId}
                                                    datasheet={datasheetQuery.data}
                                                    datasheet_services_list={datasheetQuery.data.service_list ?? []}
                                                />
                                            );

                                        case DatasheetViewActiveTabEnum.Documents:
                                            return <DocumentsTab datastoreId={datastoreId} datasheetName={datasheetName} />;
                                    }
                                })()}
                            </Tabs>
                        </div>
                    </div>
                </>
            )}

            {datasheetDeleteMutation.isPending && (
                <Wait>
                    <div className={fr.cx("fr-container")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                            <LoadingIcon className={fr.cx("fr-mr-2v")} largeIcon={true} />
                            <h6 className={fr.cx("fr-m-0")}>{t("datasheet.being_removed", { datasheetName: datasheetName })}</h6>
                        </div>
                    </div>
                </Wait>
            )}
            <>
                {createPortal(
                    <deleteDataConfirmModal.Component
                        title={t("datasheet_confirm_delete_modal.title", { datasheetName: datasheetName })}
                        buttons={[
                            {
                                children: tCommon("no"),
                                doClosesModal: true,
                                priority: "secondary",
                            },
                            {
                                children: tCommon("yes"),
                                onClick: () => datasheetDeleteMutation.mutate(),
                                priority: "primary",
                            },
                        ]}
                    >
                        <strong>{t("datasheet_confirm_delete_modal.text")}</strong>
                        <ul>
                            {datasheetQuery?.data?.vector_db_list?.length && datasheetQuery?.data?.vector_db_list.length > 0 ? (
                                <li>{datasheetQuery?.data?.vector_db_list.length} base(s) de données</li>
                            ) : null}
                            {datasheetQuery?.data?.pyramid_vector_list?.length && datasheetQuery?.data?.pyramid_vector_list.length > 0 ? (
                                <li>{datasheetQuery?.data?.pyramid_vector_list.length} pyramide(s) de tuiles vectorielles</li>
                            ) : null}
                            {datasheetQuery.data?.service_list?.length && datasheetQuery.data.service_list.length > 0 ? (
                                <li>{datasheetQuery.data?.service_list.length} service(s) publié(s)</li>
                            ) : null}
                            {datasheetQuery?.data?.upload_list?.length && datasheetQuery?.data?.upload_list.length > 0 ? (
                                <li>{datasheetQuery?.data?.upload_list.length} livraison(s)</li>
                            ) : null}

                            {metadataQuery.data && <li>La métadonnée associée ({metadataQuery.data.file_identifier})</li>}

                            {/* TODO : pyramides tuiles raster, documents etc... */}
                        </ul>
                    </deleteDataConfirmModal.Component>,
                    document.body
                )}
                {createPortal(
                    <deleteUploadConfirmModal.Component
                        title={`Voulez-vous supprimer la fiche de données ${datasheetName} ?`}
                        buttons={[
                            {
                                children: tCommon("no"),
                                doClosesModal: true,
                                priority: "secondary",
                            },
                            {
                                children: tCommon("yes"),
                                onClick: () => datasheetDeleteMutation.mutate(),
                                priority: "primary",
                            },
                        ]}
                    >
                        <strong>En supprimant cette livraison, la fiche de données {datasheetName} sera supprimée.</strong>
                    </deleteUploadConfirmModal.Component>,
                    document.body
                )}
            </>
        </DatastoreLayout>
    );
};

DatasheetView.displayName = symToStr({ DatasheetView });

export default DatasheetView;

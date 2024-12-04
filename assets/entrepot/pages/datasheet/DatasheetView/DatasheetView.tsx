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

import { DatasheetDocumentTypeEnum, type Datasheet, type DatasheetDetailed, type DatasheetDocument, type Metadata } from "../../../../@types/app";
import DatastoreLayout from "../../../../components/Layout/DatastoreLayout";
import LoadingIcon from "../../../../components/Utils/LoadingIcon";
import Wait from "../../../../components/Utils/Wait";
import { Translations, declareComponentKeys, useTranslation } from "../../../../i18n/i18n";
import RQKeys from "../../../../modules/entrepot/RQKeys";
import { type CartesApiException } from "../../../../modules/jsonFetch";
import { routes, useRoute } from "../../../../router/router";
import { getFileExtension } from "../../../../utils";
import api from "../../../api";
import DatasetListTab from "./DatasetListTab/DatasetListTab";
import DatasheetThumbnail, { type ThumbnailAction } from "./DatasheetThumbnail";
import DocumentsTab from "./DocumentsTab/DocumentsTab";
import MetadataTab from "./MetadataTab/MetadataTab";
import ServicesListTab from "./ServiceListTab/ServicesListTab";

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
        queryKey: RQKeys.datastore_metadata_by_datasheet_name(datastoreId, datasheetName),
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
                                            num: (datasheetQuery.data?.vector_db_list?.length || 0) + (datasheetQuery.data?.pyramid_list?.length || 0),
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
                                            return <MetadataTab datastoreId={datastoreId} datasheet={datasheetQuery.data} metadataQuery={metadataQuery} />;

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
                            {datasheetQuery?.data?.pyramid_list?.length && datasheetQuery?.data?.pyramid_list.length > 0 ? (
                                <li>{datasheetQuery?.data?.pyramid_list.length} pyramide(s) de tuiles vectorielles</li>
                            ) : null}
                            {datasheetQuery.data?.service_list?.length && datasheetQuery.data.service_list.length > 0 ? (
                                <li>{datasheetQuery.data?.service_list.length} service(s) publié(s)</li>
                            ) : null}
                            {datasheetQuery?.data?.upload_list?.length && datasheetQuery?.data?.upload_list.length > 0 ? (
                                <li>{datasheetQuery?.data?.upload_list.length} livraison(s)</li>
                            ) : null}

                            {metadataQuery.data && <li>La métadonnée associée ({metadataQuery.data.file_identifier})</li>}

                            {/* TODO : pyramides tuiles vectorielles, raster, métadonnées etc... */}
                        </ul>
                    </deleteDataConfirmModal.Component>,
                    document.body
                )}
            </>
        </DatastoreLayout>
    );
};

DatasheetView.displayName = symToStr({ DatasheetView });

export default DatasheetView;

// Traductions
export const { i18n } = declareComponentKeys<
    | "tab_label.metadata"
    | { K: "tab_label.datasets"; P: { num: number }; R: string }
    | { K: "tab_label.services"; P: { num: number }; R: string }
    | { K: "tab_label.documents"; P: { num: number }; R: string }
    | "datasheet.back_to_list"
    | "datasheet.remove"
    | { K: "datasheet.being_removed"; P: { datasheetName: string }; R: string }
    | "file_validation.required_error"
    | "file_validation.size_error"
    | "file_validation.format_error"
    | "button.title"
    | "thumbnail_modal.title"
    | "thumbnail_modal.file_hint"
    | { K: "thumbnail_modal.action_being"; P: { action: ThumbnailAction }; R: string }
    | { K: "thumbnail_action"; P: { action: ThumbnailAction }; R: string }
    | "thumbnail_confirm_delete_modal.title"
    | { K: "datasheet_confirm_delete_modal.title"; P: { datasheetName: string }; R: string }
    | "datasheet_confirm_delete_modal.text"
    | "metadata_tab.metadata.absent"
    | "metadata_tab.metadata.is_loading"
    | "documents_tab.documents_list.is_loading"
    | "documents_tab.add_document"
    | "documents_tab.add_document.type.label"
    | { K: "documents_tab.add_document.type.options.label"; P: { docType: DatasheetDocumentTypeEnum }; R: string }
    | "documents_tab.add_document.in_progress"
    | "documents_tab.add_document.error.name_required"
    | { K: "documents_tab.add_document.error.extention_incorrect"; P: { fileExtension: string; acceptedExtensions: string[] }; R: string }
    | "documents_tab.add_document.error.extension_missing"
    | "documents_tab.add_document.error.file_required"
    | { K: "documents_tab.add_document.error.file_too_large"; P: { maxFileSize: number }; R: string }
    | "documents_tab.add_document.error.url_required"
    | "documents_tab.add_document.error.url_invalid"
    | "documents_tab.add_document.name.label"
    | "documents_tab.add_document.description.label"
    | "documents_tab.add_document.file.label"
    | { K: "documents_tab.add_document.file.hint"; P: { acceptedExtensions: string[] }; R: string }
    | "documents_tab.add_document.link.label"
    | { K: "documents_tab.delete_document.confirmation"; P: { display?: string }; R: string }
    | "documents_tab.delete_document.in_progress"
    | "documents_tab.list.no_documents"
    | { K: "documents_tab.list.document_type"; P: { doc: DatasheetDocument }; R: string }
    | { K: "documents_tab.edit_document"; P: { name?: string }; R: string }
    | "documents_tab.edit_document.in_progress"
>()({
    DatasheetView,
});

export const DatasheetViewFrTranslations: Translations<"fr">["DatasheetView"] = {
    "tab_label.metadata": "Métadonnées",
    "tab_label.datasets": ({ num }) => `Jeux de données (${num})`,
    "tab_label.services": ({ num }) => `Services (${num})`,
    "tab_label.documents": ({ num }) => `Documents (${num})`,
    "datasheet.back_to_list": "Retour à ma liste de données",
    "datasheet.remove": "Supprimer la fiche de données",
    "datasheet.being_removed": ({ datasheetName }) => `Suppression de la fiche de données ${datasheetName} en cours ...`,
    "file_validation.required_error": "Aucun fichier n'a été choisi",
    "file_validation.size_error": "La taille du fichier ne peut excéder 2 Mo",
    "file_validation.format_error": "Le fichier doit être au format jpeg ou png",
    "button.title": "Ajouter, modifier ou supprimer la vignette",
    "thumbnail_modal.title": "Vignette pour la fiche de données",
    "thumbnail_modal.file_hint": "Taille maximale : 2 Mo. Formats acceptés : jpg, png",
    "thumbnail_modal.action_being": ({ action }) => {
        switch (action) {
            case "add":
                return "Ajout de la vignette en cours ...";
            case "modify":
                return "Remplacement de la vignette en cours ...";
            case "delete":
                return "Suppression de la vignette en cours ...";
        }
    },
    thumbnail_action: ({ action }) => {
        switch (action) {
            case "add":
                return "Ajouter une vignette";
            case "modify":
                return "Remplacer la vignette";
            case "delete":
                return "Supprimer la vignette";
        }
    },
    "thumbnail_confirm_delete_modal.title": "Êtes-vous sûr de vouloir supprimer la vignette de cette fiche de données ?",
    "datasheet_confirm_delete_modal.title": ({ datasheetName }) => `Êtes-vous sûr de supprimer la fiche de données ${datasheetName} ?`,
    "datasheet_confirm_delete_modal.text": "Les éléments suivants seront supprimés :",
    "metadata_tab.metadata.absent":
        "Les métadonnées de cette fiche ne sont pas encore disponibles. Créez un premier service à partir d’un de vos jeux de données pour les compléter.",
    "metadata_tab.metadata.is_loading": "Les métadonnées sont en cours de chargement",
    "documents_tab.documents_list.is_loading": "Les documents sont en cours de chargement",
    "documents_tab.add_document": "Ajouter un document",
    "documents_tab.add_document.type.label": "Type de document",
    "documents_tab.add_document.type.options.label": ({ docType }) => {
        switch (docType) {
            case DatasheetDocumentTypeEnum.File:
                return "Fichier";
            case DatasheetDocumentTypeEnum.Link:
                return "Lien externe";
        }
    },
    "documents_tab.add_document.in_progress": "Ajout de document en cours",
    "documents_tab.add_document.error.name_required": "Le nom est obligatoire",
    "documents_tab.add_document.error.extention_incorrect": ({ fileExtension, acceptedExtensions }) => {
        let str = `L'extension ${fileExtension} n'est pas acceptée, `;

        if (acceptedExtensions.length === 1) {
            str += ` l'extension acceptée est ${acceptedExtensions[0]}`;
        } else {
            const lastExtension = acceptedExtensions.pop();

            str += `les extensions acceptées sont ${acceptedExtensions.join(", ")} et ${lastExtension}`;
        }

        return str;
    },
    "documents_tab.add_document.error.extension_missing": "Extension du fichier manquante",
    "documents_tab.add_document.error.file_required": "Le fichier est obligatoire",
    "documents_tab.add_document.error.file_too_large": ({ maxFileSize }) => `La taille du fichier téléversé ne peux excéder ${maxFileSize} Mo`,
    "documents_tab.add_document.error.url_required": "L'URL est obligatoire",
    "documents_tab.add_document.error.url_invalid": "L'URL est invalide",
    "documents_tab.add_document.name.label": "Nom du document",
    "documents_tab.add_document.description.label": "Description du document (optionnelle)",
    "documents_tab.add_document.file.label": "Téléverser un fichier",
    "documents_tab.add_document.file.hint": ({ acceptedExtensions }) => {
        let acceptedExtensionsStr: string;

        if (acceptedExtensions.length === 1) {
            acceptedExtensionsStr = acceptedExtensions[0];
        } else {
            const lastExtension = acceptedExtensions.pop();
            acceptedExtensionsStr = `${acceptedExtensions.join(", ")} ou ${lastExtension}`;
        }

        return `Fichier ${acceptedExtensionsStr} de moins de 5 Mo uniquement`;
    },
    "documents_tab.add_document.link.label": "Lien vers le document",
    "documents_tab.delete_document.confirmation": ({ display }) => `Êtes-vous sûr de vouloir supprimer le document ${display} ?`,
    "documents_tab.delete_document.in_progress": "Suppression du document en cours",
    "documents_tab.list.no_documents": "Il n'y a pas encore de documents liés à cette fiche de données.",
    "documents_tab.list.document_type": ({ doc }) => {
        if (doc.type === DatasheetDocumentTypeEnum.Link.valueOf()) {
            return "Lien externe";
        }

        const fileExtension = getFileExtension(doc.url)?.toLowerCase();

        switch (fileExtension) {
            case "pdf":
                return "PDF";
            case "qgz":
                return "Projet QGIS";
            default:
                return doc.type.toUpperCase();
        }
    },
    "documents_tab.edit_document": ({ name }) => `Modifier le document ${name}`,
    "documents_tab.edit_document.in_progress": "Modification du document en cours",
};

export const DatasheetViewEnTranslations: Translations<"en">["DatasheetView"] = {
    "tab_label.metadata": "Metadata",
    "tab_label.datasets": ({ num }) => `Datasets (${num})`,
    "tab_label.services": ({ num }) => `Services (${num})`,
    "tab_label.documents": ({ num }) => `Documents (${num})`,
    "datasheet.back_to_list": "Back to my data list",
    "datasheet.remove": "Delete datasheet",
    "datasheet.being_removed": ({ datasheetName }) => `Datasheet ${datasheetName} being removed ...`,
    "file_validation.required_error": "No files have been chosen",
    "file_validation.size_error": "File size cannot exceed 2 MB",
    "file_validation.format_error": "Format required for file is jpeg or png",
    "button.title": "Add, modify or remove thumbnail",
    "thumbnail_modal.title": "Datasheet thumbnail",
    "thumbnail_modal.file_hint": "Max size : 2 Mo. Accepted formats : jpg, png",
    "thumbnail_modal.action_being": ({ action }) => {
        switch (action) {
            case "add":
                return "Thumbnail being added ...";
            case "modify":
                return "Thumbnail being replaced ...";
            case "delete":
                return "Thumbnail being deleted ...";
        }
    },
    thumbnail_action: ({ action }) => {
        switch (action) {
            case "add":
                return "Add thumbnail";
            case "modify":
                return "Replace thumbnail";
            case "delete":
                return "Delete thumbnail";
        }
    },
    "thumbnail_confirm_delete_modal.title": "Are you sure you want to remove the thumbnail from this data sheet",
    "datasheet_confirm_delete_modal.title": ({ datasheetName }) => `Are you sure you want to delete datasheet ${datasheetName} ?`,
    "datasheet_confirm_delete_modal.text": "The following items will be deleted :",
    "metadata_tab.metadata.absent": undefined,
    "metadata_tab.metadata.is_loading": undefined,
    "documents_tab.documents_list.is_loading": undefined,
    "documents_tab.add_document": undefined,
    "documents_tab.add_document.type.label": undefined,
    "documents_tab.add_document.type.options.label": undefined,
    "documents_tab.add_document.in_progress": undefined,
    "documents_tab.add_document.error.name_required": undefined,
    "documents_tab.add_document.error.extention_incorrect": undefined,
    "documents_tab.add_document.error.extension_missing": undefined,
    "documents_tab.add_document.error.file_required": undefined,
    "documents_tab.add_document.error.file_too_large": undefined,
    "documents_tab.add_document.error.url_required": undefined,
    "documents_tab.add_document.error.url_invalid": undefined,
    "documents_tab.add_document.name.label": undefined,
    "documents_tab.add_document.description.label": undefined,
    "documents_tab.add_document.file.label": undefined,
    "documents_tab.add_document.file.hint": undefined,
    "documents_tab.add_document.link.label": undefined,
    "documents_tab.delete_document.confirmation": undefined,
    "documents_tab.delete_document.in_progress": undefined,
    "documents_tab.list.no_documents": undefined,
    "documents_tab.list.document_type": undefined,
    "documents_tab.edit_document": undefined,
    "documents_tab.edit_document.in_progress": undefined,
};

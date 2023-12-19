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

import api from "../../../api";
import DatastoreLayout from "../../../components/Layout/DatastoreLayout";
import LoadingText from "../../../components/Utils/LoadingText";
import Wait from "../../../components/Utils/Wait";
import { Translations, declareComponentKeys, useTranslation } from "../../../i18n/i18n";
import RQKeys from "../../../modules/RQKeys";
import { type CartesApiException } from "../../../modules/jsonFetch";
import { routes, useRoute } from "../../../router/router";
import { Datasheet, type DatasheetDetailed } from "../../../types/app";
import DatasetListTab from "./DatasetListTab/DatasetListTab";
import DatasheetThumbnail, { type ThumbnailAction } from "./DatasheetThumbnail";
import ServicesListTab from "./ServiceListTab/ServicesListTab";

import "../../../sass/components/spinner.scss";

const deleteDataConfirmModal = createModal({
    id: "delete-data-confirm-modal",
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
    const queryClient = useQueryClient();

    const datasheetDeleteMutation = useMutation({
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
        // staleTime: 20000,
        // refetchInterval: 20000,
        retry: false,
        enabled: !datasheetDeleteMutation.isPending,
    });

    return (
        <DatastoreLayout datastoreId={datastoreId} documentTitle={`Données ${datasheetName}`}>
            {datasheetQuery.isLoading ? (
                <LoadingText />
            ) : datasheetQuery.error ? (
                <Alert
                    severity="error"
                    closable={false}
                    title={datasheetQuery.error.message}
                    description={<Button linkProps={routes.datasheet_list({ datastoreId }).link}>{t("datasheet.back_to_list")}</Button>}
                />
            ) : (
                <>
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-mb-4w")}>
                        <Button
                            iconId="fr-icon-arrow-left-s-line"
                            priority="tertiary no outline"
                            linkProps={routes.datasheet_list({ datastoreId }).link}
                            title={t("datasheet.back_to_list")}
                        />
                        {datasheetName}
                        <Badge noIcon={true} severity="info" className={fr.cx("fr-ml-2w")}>
                            {datasheetQuery?.data?.nb_publications && datasheetQuery?.data?.nb_publications > 0
                                ? tCommon("published")
                                : tCommon("not_published")}
                        </Badge>
                    </div>

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
                        <div className={fr.cx("fr-col")}>
                            <Tabs
                                tabs={[
                                    {
                                        label: t("tab_label.metadatas"),
                                        isDefault: route.params["activeTab"] === "metadata",
                                        content: <p>Liste des métadonnées à venir (bloqué par une évolution nécessaire sur les tags des entités metadata)</p>,
                                    },
                                    {
                                        label: t("tab_label.datasets", { num: datasheetQuery?.data?.vector_db_list?.length || 0 }),
                                        isDefault: route.params["activeTab"] === "dataset",
                                        content: <DatasetListTab datastoreId={datastoreId} datasheet={datasheetQuery?.data} />,
                                    },
                                    {
                                        label: t("tab_label.services", { num: datasheetQuery?.data?.service_list?.length || 0 }),
                                        isDefault: route.params["activeTab"] === "services",
                                        content: <ServicesListTab datastoreId={datastoreId} datasheet={datasheetQuery?.data} />,
                                    },
                                ]}
                                onTabChange={({ tabIndex }) => {
                                    let activeTab = "dataset";
                                    switch (tabIndex) {
                                        case 0:
                                            activeTab = "metadata";
                                            break;
                                        case 1:
                                            activeTab = "dataset";
                                            break;
                                        case 2:
                                            activeTab = "services";
                                            break;
                                    }
                                    routes.datastore_datasheet_view({ datastoreId, datasheetName, activeTab }).push();
                                }}
                            />
                        </div>
                    </div>
                </>
            )}

            {datasheetDeleteMutation.isPending && (
                <Wait>
                    <div className={fr.cx("fr-container")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                            <i className={fr.cx("fr-icon-refresh-line", "fr-icon--lg", "fr-mr-2v") + " icons-spin"} />
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
                                doClosesModal: false,
                                priority: "primary",
                            },
                        ]}
                    >
                        <strong>{t("datasheet_confirm_delete_modal.text")}</strong>
                        <ul>
                            {datasheetQuery?.data?.vector_db_list?.length && datasheetQuery?.data?.vector_db_list.length > 0 ? (
                                <li> {datasheetQuery?.data?.vector_db_list.length} base(s) de données</li>
                            ) : null}
                            {datasheetQuery?.data?.service_list?.length && datasheetQuery?.data?.service_list.length > 0 ? (
                                <li> {datasheetQuery?.data?.service_list.length} service(s) publié(s)</li>
                            ) : null}
                            {datasheetQuery?.data?.upload_list?.length && datasheetQuery?.data?.upload_list.length > 0 ? (
                                <li> {datasheetQuery?.data?.upload_list.length} livraison(s)</li>
                            ) : null}

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
    | "tab_label.metadatas"
    | { K: "tab_label.datasets"; P: { num: number }; R: string }
    | { K: "tab_label.services"; P: { num: number }; R: string }
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
    | { K: "datasheet_confirm_delete_modal.title"; P: { datasheetName: string }; R: string }
    | "datasheet_confirm_delete_modal.text"
>()({
    DatasheetView,
});

export const DatasheetViewFrTranslations: Translations<"fr">["DatasheetView"] = {
    "tab_label.metadatas": "Métadonnées (0)",
    "tab_label.datasets": ({ num }) => `Jeux de données (${num})`,
    "tab_label.services": ({ num }) => `Services (${num})`,
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
    "datasheet_confirm_delete_modal.title": ({ datasheetName }) => `Êtes-vous sûr de supprimer la fiche de données ${datasheetName} ?`,
    "datasheet_confirm_delete_modal.text": "Les éléments suivants seront supprimés :",
};

export const DatasheetViewEnTranslations: Translations<"en">["DatasheetView"] = {
    "tab_label.metadatas": "Metadatas (0)",
    "tab_label.datasets": ({ num }) => `Datasets (${num})`,
    "tab_label.services": ({ num }) => `Services (${num})`,
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
    "datasheet_confirm_delete_modal.title": ({ datasheetName }) => `Are you sure you want to delete datasheet ${datasheetName} ?`,
    "datasheet_confirm_delete_modal.text": "The following items will be deleted :",
};

import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import { ButtonsGroup } from "@codegouvfr/react-dsfr/ButtonsGroup";
import { ModalProps, createModal } from "@codegouvfr/react-dsfr/Modal";
import { Tabs } from "@codegouvfr/react-dsfr/Tabs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { symToStr } from "tsafe/symToStr";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

import api from "../../../api";
import DatastoreLayout from "../../../components/Layout/DatastoreLayout";
import LoadingText from "../../../components/Utils/LoadingText";
import Wait from "../../../components/Utils/Wait";
import RQKeys from "../../../modules/RQKeys";
import { type CartesApiException } from "../../../modules/jsonFetch";
import { routes, useRoute } from "../../../router/router";
import { Datasheet, type DatasheetDetailed } from "../../../types/app";
import DatasetListTab from "./DatasetListTab/DatasetListTab";
import ServicesListTab from "./ServiceListTab/ServicesListTab";
import path from "../../../functions/path";

import "../../../sass/components/spinner.scss";
import { Upload } from "@codegouvfr/react-dsfr/Upload";
import { useForm } from "react-hook-form";
import { AnnexDetailResponseDto } from "../../../types/entrepot";
import Common from "../../../i18n/Common";
import { ComponentKey, Translations, declareComponentKeys, useTranslation } from "../../../i18n/i18n";
import { TranslationFunction } from "i18nifty/typeUtils/TranslationFunction";

const deleteDataConfirmModal = createModal({
    id: "delete-data-confirm-modal",
    isOpenedByDefault: false,
});

const addThumbnailModal = createModal({
    id: "add-thumbnail-modal",
    isOpenedByDefault: false,
});

type DatasheetViewProps = {
    datastoreId: string;
    datasheetName: string;
};

type Action = "add" | "modify" | "delete";

const defaultImgUrl = "//www.gouvernement.fr/sites/default/files/static_assets/placeholder.1x1.png";

const schema = (t: TranslationFunction<"DatasheetView", ComponentKey>) =>
    yup.object().shape({
        file: yup
            .mixed()
            .test("required", t("file_validation.required_error"), (files) => {
                const file = files?.[0] ?? undefined;
                return file !== undefined;
            })
            .test("check-file-size", t("file_validation.size_error"), (files) => {
                const file = files?.[0] ?? undefined;

                if (file instanceof File) {
                    const size = file.size / 1024 / 1024;
                    return size < 2;
                }
                return true;
            })
            .test("check-file-type", t("file_validation.format_error"), (files) => {
                const file = files?.[0] ?? undefined;
                if (file) {
                    const extension = path.getFileExtension(file.name);
                    if (!extension) {
                        return false;
                    }
                    return ["jpg", "jpeg", "png"].includes(extension);
                }
                return true;
            }),
    });

const DatasheetView: FC<DatasheetViewProps> = ({ datastoreId, datasheetName }) => {
    const { t: tCommon } = useTranslation({ Common });
    const { t } = useTranslation({ DatasheetView });

    // Boite modale, gestion de l'image
    const [modalImageUrl, setModalImageUrl] = useState<string>("");

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

    // Ajout/modification d'une vignette
    const thumbnailMutation = useMutation<AnnexDetailResponseDto & { url: string }, CartesApiException>({
        mutationFn: () => {
            const form = new FormData();
            form.append("datasheetName", datasheetName);
            form.append("file", upload);
            return api.annexe.addThumbnail(datastoreId, form);
        },
        onSuccess: () => {
            addThumbnailModal.close();
            queryClient.refetchQueries({ queryKey: RQKeys.datastore_datasheet(datastoreId, datasheetName) });
        },
        onSettled: () => {
            reset();
        },
    });

    // Suppression d'une vignette
    const deleteThumbnailMutation = useMutation<null, CartesApiException>({
        mutationFn: () => {
            const id = datasheetQuery?.data?.thumbnail?._id;
            if (id) {
                return api.annexe.removeThumbnail(datastoreId, id);
            }
            return Promise.resolve(null);
        },
        onSuccess: () => {
            addThumbnailModal.close();
            queryClient.refetchQueries({ queryKey: RQKeys.datastore_datasheet(datastoreId, datasheetName) });
        },
        onSettled: () => {
            reset();
        },
    });

    const datasheetQuery = useQuery<DatasheetDetailed, CartesApiException>({
        queryKey: RQKeys.datastore_datasheet(datastoreId, datasheetName),
        queryFn: ({ signal }) => api.datasheet.get(datastoreId, datasheetName, { signal }),
        staleTime: 20000,
        refetchInterval: 20000,
        retry: false,
        enabled: !datasheetDeleteMutation.isPending,
    });

    // Url de la vignette
    const thumbnailUrl = datasheetQuery?.data?.thumbnail?.url || "";
    const action: Action = datasheetQuery?.data?.thumbnail?.url ? "modify" : "add";

    const {
        register,
        formState: { errors },
        watch,
        resetField,
        handleSubmit,
    } = useForm({ resolver: yupResolver(schema(t)), mode: "onChange" });

    const upload: File = watch("file")?.[0];
    useEffect(() => {
        if (upload !== undefined) {
            const reader = new FileReader();
            reader.onload = () => {
                setModalImageUrl(reader.result as string);
            };
            reader.readAsDataURL(upload);
        }
    }, [upload]);

    const handleChooseThumbnail = () => {
        addThumbnailModal.open();
    };

    const reset = () => {
        resetField("file");
        setModalImageUrl("");
    };

    const onSubmit = async () => {
        if (upload) {
            // Ajout dans les annexes
            thumbnailMutation.mutate();
        }
    };

    // Boutons de la boite de dialogue
    const thumbnailModalButtons: [ModalProps.ActionAreaButtonProps, ...ModalProps.ActionAreaButtonProps[]] = [
        {
            children: tCommon("cancel"),
            onClick: () => {
                reset();
                thumbnailMutation.reset();
            },
            doClosesModal: true,
            priority: "secondary",
        },
    ];
    if (datasheetQuery?.data?.thumbnail?._id) {
        thumbnailModalButtons.push({
            children: tCommon("delete"),
            iconId: "fr-icon-delete-line",
            onClick: () => {
                deleteThumbnailMutation.mutate();
            },
            doClosesModal: false,
            priority: "secondary",
        });
    }
    thumbnailModalButtons.push({
        children: t("thumbnail_action", { action: action }),
        onClick: handleSubmit(onSubmit),
        doClosesModal: false,
        priority: "primary",
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
                            <Button
                                priority="tertiary no outline"
                                onClick={handleChooseThumbnail}
                                nativeButtonProps={{ "aria-label": t("button.title"), title: t("button.title") }}
                            >
                                <img src={thumbnailUrl === "" ? defaultImgUrl : thumbnailUrl} width={"128px"} />
                            </Button>
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
                                        content: <p>...liste de métadonnées...</p>,
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
                    <addThumbnailModal.Component title={t("thumbnail_modal.title")} buttons={thumbnailModalButtons}>
                        {thumbnailMutation.isError && (
                            <Alert
                                severity="error"
                                closable
                                title={tCommon("error")}
                                description={thumbnailMutation.error.message}
                                className={fr.cx("fr-my-3w")}
                            />
                        )}
                        {deleteThumbnailMutation.isError && (
                            <Alert
                                severity="error"
                                closable
                                title={tCommon("error")}
                                description={deleteThumbnailMutation.error.message}
                                className={fr.cx("fr-my-3w")}
                            />
                        )}
                        <div className={fr.cx("fr-grid-row")}>
                            <div className={fr.cx("fr-col-9")}>
                                <Upload
                                    label={""}
                                    hint={t("thumbnail_modal.file_hint")}
                                    state={errors.file ? "error" : "default"}
                                    stateRelatedMessage={errors?.file?.message}
                                    nativeInputProps={{
                                        ...register("file"),
                                        accept: ".png, .jpg, .jpeg",
                                    }}
                                />
                            </div>
                            <div className={fr.cx("fr-col-3")}>
                                <img src={modalImageUrl === "" ? defaultImgUrl : modalImageUrl} width="128px" />
                            </div>
                        </div>
                        {thumbnailMutation.isPending && (
                            <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                                <i className={fr.cx("fr-icon-refresh-line", "fr-icon--lg", "fr-mr-2v") + " icons-spin"} />
                                <h6 className={fr.cx("fr-m-0")}>{t("thumbnail_modal.action_being", { action: action })}</h6>
                            </div>
                        )}
                        {deleteThumbnailMutation.isPending && (
                            <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                                <i className={fr.cx("fr-icon-refresh-line", "fr-icon--lg", "fr-mr-2v") + " icons-spin"} />
                                <h6 className={fr.cx("fr-m-0")}>{t("thumbnail_modal.action_being", { action: "delete" })}</h6>
                            </div>
                        )}
                    </addThumbnailModal.Component>,
                    document.body
                )}
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
                                onClick: () => thumbnailMutation.mutate(),
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
    | { K: "thumbnail_modal.action_being"; P: { action: Action }; R: string }
    | { K: "thumbnail_action"; P: { action: Action }; R: string }
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
                return "Modification de la vignette en cours ...";
            case "delete":
                return "Suppression de la vignette en cours ...";
        }
    },
    thumbnail_action: ({ action }) => {
        switch (action) {
            case "add":
                return "Ajouter une vignette";
            case "modify":
                return "Modifier une vignette";
            case "delete":
                return "Supprimer une vignette";
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
                return "Thumbnail being modified ...";
            case "delete":
                return "Thumbnail being deleted ...";
        }
    },
    thumbnail_action: ({ action }) => {
        switch (action) {
            case "add":
                return "Add thumbnail";
            case "modify":
                return "Modify thumbnail";
            case "delete":
                return "Delete thumbnail";
        }
    },
    "datasheet_confirm_delete_modal.title": ({ datasheetName }) => `Are you sure you want to delete datasheet ${datasheetName} ?`,
    "datasheet_confirm_delete_modal.text": "The following items will be deleted :",
};

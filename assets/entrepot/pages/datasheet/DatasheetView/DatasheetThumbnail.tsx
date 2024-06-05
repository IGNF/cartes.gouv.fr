import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { createModal, ModalProps } from "@codegouvfr/react-dsfr/Modal";
import { Upload } from "@codegouvfr/react-dsfr/Upload";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TranslationFunction } from "i18nifty/typeUtils/TranslationFunction";
import { FC, memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { useHover } from "usehooks-ts";
import * as yup from "yup";

import type { Datasheet, DatasheetDetailed, DatasheetThumbnailAnnexe } from "../../../../@types/app";
import { ConfirmDialog, ConfirmDialogModal } from "../../../../components/Utils/ConfirmDialog";
import Wait from "../../../../components/Utils/Wait";
import { ComponentKey, useTranslation } from "../../../../i18n/i18n";
import RQKeys from "../../../../modules/entrepot/RQKeys";
import { CartesApiException } from "../../../../modules/jsonFetch";
import { getFileExtension } from "../../../../utils";
import api from "../../../api";

import "../../../../sass/components/buttons.scss";

import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import placeholder1x1 from "../../../../img/placeholder.1x1.png";

const addThumbnailModal = createModal({
    id: "add-thumbnail-modal",
    isOpenedByDefault: false,
});

export type ThumbnailAction = "add" | "modify" | "delete";

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
                    const extension = getFileExtension(file.name);
                    if (!extension) {
                        return false;
                    }
                    return ["jpg", "jpeg", "png"].includes(extension);
                }
                return true;
            }),
    });

type DatasheetThumbnailProps = {
    datastoreId: string;
    datasheetName: string;
    datasheet?: Datasheet;
};

const DatasheetThumbnail: FC<DatasheetThumbnailProps> = ({ datastoreId, datasheetName, datasheet }) => {
    const queryClient = useQueryClient();
    const { t: tCommon } = useTranslation("Common");
    const { t } = useTranslation("DatasheetView");

    // Boite modale, gestion de l'image
    const [modalImageUrl, setModalImageUrl] = useState<string>("");
    const thumbnailDivRef = useRef(null);
    const thumbnailIsHovered = useHover(thumbnailDivRef);

    // Ajout/modification de la vignette
    const addThumbnailMutation = useMutation<DatasheetThumbnailAnnexe, CartesApiException>({
        mutationFn: () => {
            const form = new FormData();
            form.append("datasheetName", datasheetName);
            form.append("file", upload);
            return api.annexe.addThumbnail(datastoreId, form);
        },
        onSuccess: (response) => {
            addThumbnailModal.close();

            // Mise à jour du contenu de la réponse de datasheetQuery
            queryClient.setQueryData<DatasheetDetailed>(RQKeys.datastore_datasheet(datastoreId, datasheetName), (datasheet) => {
                if (datasheet) {
                    datasheet.thumbnail = response;
                }
                return datasheet;
            });

            // Mise à jour du contenu de la réponse de datasheetListQuery
            queryClient.setQueryData<Datasheet[]>(RQKeys.datastore_datasheet_list(datastoreId), (datasheetList = []) => {
                return datasheetList.map((datasheet) => {
                    if (datasheet.name === datasheetName) {
                        datasheet.thumbnail = response;
                    }
                    return datasheet;
                });
            });
        },
        onSettled: () => {
            reset();
        },
    });

    // Suppression de la vignette
    const deleteThumbnailMutation = useMutation<null, CartesApiException>({
        mutationFn: () => {
            if (datasheet?.thumbnail?._id) {
                return api.annexe.removeThumbnail(datastoreId, datasheetName, datasheet?.thumbnail?._id);
            }
            return Promise.resolve(null);
        },
        onSuccess: () => {
            // mise à jour du contenu de la réponse de datasheetQuery
            queryClient.setQueryData<DatasheetDetailed>(RQKeys.datastore_datasheet(datastoreId, datasheetName), (datasheet) => {
                if (datasheet) {
                    datasheet.thumbnail = undefined;
                }
                return datasheet;
            });

            // mise à jour du contenu de la réponse de datasheetListQuery
            queryClient.setQueryData<Datasheet[]>(RQKeys.datastore_datasheet_list(datastoreId), (datasheetList = []) => {
                return datasheetList.map((datasheet) => {
                    if (datasheet.name === datasheetName) {
                        datasheet.thumbnail = undefined;
                    }
                    return datasheet;
                });
            });
        },
        onSettled: () => {
            reset();
        },
    });

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

    const reset = useCallback(() => {
        resetField("file");
        setModalImageUrl("");
    }, [resetField]);

    const onSubmit = useCallback(async () => {
        if (upload) {
            // Ajout dans les annexes
            addThumbnailMutation.mutate();
        }
    }, [addThumbnailMutation, upload]);

    const action: ThumbnailAction = useMemo(() => (datasheet?.thumbnail?.url ? "modify" : "add"), [datasheet?.thumbnail?.url]);

    // Boutons de la boite de dialogue
    const thumbnailModalButtons: [ModalProps.ActionAreaButtonProps, ...ModalProps.ActionAreaButtonProps[]] = useMemo(() => {
        const btns: [ModalProps.ActionAreaButtonProps, ...ModalProps.ActionAreaButtonProps[]] = [
            {
                children: tCommon("cancel"),
                onClick: () => {
                    reset();
                    addThumbnailMutation.reset();
                },
                doClosesModal: true,
                priority: "secondary",
            },
            {
                children: t("thumbnail_action", { action: action }),
                onClick: handleSubmit(onSubmit),
                doClosesModal: false,
                priority: "primary",
            },
        ];

        return btns;
    }, [action, addThumbnailMutation, handleSubmit, onSubmit, reset, t, tCommon]);

    return (
        <>
            <div className={"frx-thumbnail"} aria-label={t("button.title")} title={t("button.title")} ref={thumbnailDivRef}>
                <img
                    className={thumbnailIsHovered ? "frx-btn--transparent fr-img--transparent-transition" : ""}
                    loading="lazy"
                    src={datasheet?.thumbnail?.url === undefined ? placeholder1x1 : datasheet?.thumbnail?.url}
                />
                {thumbnailIsHovered && (
                    <div className="frx-btn--hover-icon">
                        <Button
                            title={t("thumbnail_action", { action: action })}
                            iconId="fr-icon-edit-line"
                            priority="tertiary no outline"
                            onClick={addThumbnailModal.open}
                        />
                        {datasheet?.thumbnail?._id !== undefined && (
                            <Button
                                title={t("thumbnail_action", { action: "delete" })}
                                iconId="fr-icon-delete-line"
                                priority="tertiary no outline"
                                onClick={ConfirmDialogModal.open}
                            />
                        )}
                    </div>
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
                {deleteThumbnailMutation.isPending && (
                    <Wait>
                        <div className={fr.cx("fr-container")}>
                            <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                                <i className={fr.cx("fr-icon-refresh-line", "fr-icon--lg", "fr-mr-2v") + " frx-icon-spin"} />
                                <h6 className={fr.cx("fr-m-0")}>{t("thumbnail_modal.action_being", { action: "delete" })}</h6>
                            </div>
                        </div>
                    </Wait>
                )}
            </div>
            {createPortal(
                <addThumbnailModal.Component title={t("thumbnail_modal.title")} buttons={thumbnailModalButtons}>
                    {addThumbnailMutation.isError && (
                        <Alert
                            severity="error"
                            closable
                            title={tCommon("error")}
                            description={addThumbnailMutation.error.message}
                            className={fr.cx("fr-my-3w")}
                        />
                    )}
                    <div className={fr.cx("fr-grid-row")}>
                        <div className={fr.cx("fr-col-9")}>
                            <Upload
                                hint={t("thumbnail_modal.file_hint")}
                                state={errors.file ? "error" : "default"}
                                stateRelatedMessage={errors?.file?.message}
                                nativeInputProps={{
                                    ...register("file"),
                                    accept: ".png, .jpg, .jpeg",
                                }}
                                className={fr.cx("fr-input-group")}
                            />
                        </div>
                        <div className={cx(fr.cx("fr-col-3"), "frx-thumbnail-modal")}>
                            <img src={modalImageUrl === "" ? placeholder1x1 : modalImageUrl} width="128px" />
                        </div>
                    </div>
                    {addThumbnailMutation.isPending && (
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                            <i className={fr.cx("fr-icon-refresh-line", "fr-icon--lg", "fr-mr-2v") + " frx-icon-spin"} />
                            <h6 className={fr.cx("fr-m-0")}>{t("thumbnail_modal.action_being", { action: action })}</h6>
                        </div>
                    )}
                </addThumbnailModal.Component>,
                document.body
            )}
            <ConfirmDialog
                title={t("thumbnail_confirm_delete_modal.title")}
                onConfirm={() => {
                    deleteThumbnailMutation.mutate();
                }}
            />
        </>
    );
};

export default memo(DatasheetThumbnail);

import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { createModal, ModalProps } from "@codegouvfr/react-dsfr/Modal";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { Upload } from "@codegouvfr/react-dsfr/Upload";
import { yupResolver } from "@hookform/resolvers/yup";
import { TranslationFunction } from "i18nifty/typeUtils/TranslationFunction";
import { FC, memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { useHover } from "usehooks-ts";
import * as yup from "yup";
import { ConfirmDialog, ConfirmDialogModal } from "../../../../components/Utils/ConfirmDialog";
import { ComponentKey, useTranslation } from "../../../../i18n/i18n";
import { getFileExtension, getImageSize, ImageSize } from "../../../../utils";
import { logoAction } from "../ManageCommunityTr";

import placeholder1x1 from "../../../../img/placeholder.1x1.png";
import "../../../../sass/components/buttons.scss";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CartesApiException } from "../../../../modules/jsonFetch";
import { CommunityResponseDTO } from "../../../../@types/espaceco";
import api from "../../../api";

type CommunityLogoProps = {
    communityId: number;
    logoUrl: string | null;
};

const AddLogoModal = createModal({
    id: "add-logo-modal",
    isOpenedByDefault: false,
});

const schema = (t: TranslationFunction<"ManageCommunityValidations", ComponentKey>) =>
    yup.object().shape({
        logo: yup
            .mixed()
            .test("check-file-size", t("description.logo.size_error"), (files) => {
                const file = files?.[0] ?? undefined;

                if (file instanceof File) {
                    const size = file.size / 1024 / 1024;
                    return size < 5;
                }
                return true;
            })
            .test("check-file-dimensions", t("description.logo.dimensions_error"), async (files) => {
                const file = files?.[0] ?? undefined;
                if (file) {
                    const size: ImageSize = await getImageSize(file);
                    if (size.width > 400 || size.height > 400) {
                        return false;
                    }
                }
                return true;
            })
            .test("check-file-type", t("description.logo.format_error"), (files) => {
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

const CommunityLogo: FC<CommunityLogoProps> = ({ communityId, logoUrl }) => {
    const { t: tCommon } = useTranslation("Common");
    const { t: tValidation } = useTranslation("ManageCommunityValidations");
    const { t } = useTranslation("ManageCommunity");

    const [isValid, setIsValid] = useState(false);
    useEffect(() => {
        if (logoUrl) {
            fetch(logoUrl).then((res) => {
                setIsValid(() => res.status === 200);
            });
        }
    }, [logoUrl]);

    const action: logoAction = useMemo(() => (isValid ? "modify" : "add"), [isValid]);

    // Boite modale, gestion de l'image
    const [modalImageUrl, setModalImageUrl] = useState<string>("");
    const logoDivRef = useRef(null);
    const logoIsHovered = useHover(logoDivRef);

    // const queryClient = useQueryClient();

    // Ajout/modification du logo
    const updateLogoMutation = useMutation<CommunityResponseDTO, CartesApiException>({
        mutationFn: () => {
            const form = new FormData();
            form.append("logo", upload);
            return api.community.updateLogo(communityId, form);
        },
        onSuccess: (response) => {
            AddLogoModal.close();

            // Mise à jour du contenu de la réponse de datasheetQuery
            /*queryClient.setQueryData<DatasheetDetailed>(RQKeys.datastore_datasheet(datastoreId, datasheetName), (datasheet) => {
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
            });*/
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
    } = useForm({ resolver: yupResolver(schema(tValidation)), mode: "onChange" });

    const upload: File = watch("logo")?.[0];

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
        resetField("logo");
        setModalImageUrl("");
    }, [resetField]);

    const onSubmit = useCallback(async () => {
        if (upload) {
            // Ajout du logo
            updateLogoMutation.mutate();
        }
    }, [updateLogoMutation, upload]);

    // Boutons de la boite de dialogue
    const AddModalButtons: [ModalProps.ActionAreaButtonProps, ...ModalProps.ActionAreaButtonProps[]] = useMemo(() => {
        const btns: [ModalProps.ActionAreaButtonProps, ...ModalProps.ActionAreaButtonProps[]] = [
            {
                children: tCommon("cancel"),
                onClick: () => {
                    reset();
                    // addThumbnailMutation.reset();
                },
                doClosesModal: true,
                priority: "secondary",
            },
            {
                children: t("logo_action", { action: action }),
                onClick: handleSubmit(onSubmit),
                doClosesModal: false,
                priority: "primary",
            },
        ];

        return btns;
    }, [action, /*addThumbnailMutation,*/ handleSubmit, onSubmit, reset, t, tCommon]);

    return (
        <div className={fr.cx("fr-input-group")}>
            <label className={fr.cx("fr-label")}>{t("desc.logo")}</label>
            <div className={cx(fr.cx("fr-mt-1v"), "frx-thumbnail")} aria-label={t("desc.logo.title")} title={t("desc.logo.title")} ref={logoDivRef}>
                <img
                    className={logoIsHovered ? "frx-btn--transparent fr-img--transparent-transition" : ""}
                    loading="lazy"
                    src={isValid ? logoUrl : placeholder1x1}
                    /* onError={({ currentTarget }) => {
                        currentTarget.onerror = null; // prevents looping
                        currentTarget.src = placeholder1x1;
                    }} */
                />
                {logoIsHovered && (
                    <div className="frx-btn--hover-icon">
                        <Button
                            title={t("logo_action", { action: action })}
                            iconId="fr-icon-edit-line"
                            priority="tertiary no outline"
                            onClick={AddLogoModal.open}
                        />
                        {logoUrl !== null && (
                            <Button
                                title={t("logo_action", { action: "delete" })}
                                iconId="fr-icon-delete-line"
                                priority="tertiary no outline"
                                onClick={ConfirmDialogModal.open}
                            />
                        )}
                    </div>
                )}
            </div>
            {createPortal(
                <AddLogoModal.Component title={t("modal.logo.title")} buttons={AddModalButtons}>
                    {/* {addThumbnailMutation.isError && (
                        <Alert
                            severity="error"
                            closable
                            title={tCommon("error")}
                            description={addThumbnailMutation.error.message}
                            className={fr.cx("fr-my-3w")}
                        />
                    )} */}
                    <div className={fr.cx("fr-grid-row")}>
                        <div className={fr.cx("fr-col-9")}>
                            <Upload
                                hint={t("modal.logo.file_hint")}
                                state={errors.logo ? "error" : "default"}
                                stateRelatedMessage={errors?.logo?.message}
                                nativeInputProps={{
                                    ...register("logo"),
                                    accept: ".png, .jpg, .jpeg",
                                }}
                                className={fr.cx("fr-input-group")}
                            />
                        </div>
                        <div className={cx(fr.cx("fr-col-3"), "frx-thumbnail-modal")}>
                            <img src={modalImageUrl === "" ? placeholder1x1 : modalImageUrl} width="128px" />
                        </div>
                    </div>
                    {/* {addThumbnailMutation.isPending && (
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                            <i className={fr.cx("fr-icon-refresh-line", "fr-icon--lg", "fr-mr-2v") + " frx-icon-spin"} />
                            <h6 className={fr.cx("fr-m-0")}>{t("thumbnail_modal.action_being", { action: action })}</h6>
                        </div>
                    )} */}
                </AddLogoModal.Component>,
                document.body
            )}
            <ConfirmDialog
                title={t("logo_confirm_delete_modal.title")}
                onConfirm={() => {
                    // deleteThumbnailMutation.mutate();
                }}
            />
        </div>
    );
};

export default memo(CommunityLogo);

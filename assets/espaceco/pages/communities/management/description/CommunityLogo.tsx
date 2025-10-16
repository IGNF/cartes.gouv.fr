import ConfirmDialog, { ConfirmDialogModal } from "@/components/Utils/ConfirmDialog";
import { useCommunityContext } from "@/espaceco/contexts/CommunityContext";
import { useTranslation } from "@/i18n/i18n";
import RQKeys from "@/modules/espaceco/RQKeys";
import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { createModal, ModalProps } from "@codegouvfr/react-dsfr/Modal";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { Upload } from "@codegouvfr/react-dsfr/Upload";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TranslationFunction } from "i18nifty/typeUtils/TranslationFunction";
import { FC, memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { useHover } from "usehooks-ts";
import * as yup from "yup";
import { CommunityResponseDTO } from "../../../../../@types/espaceco";
import { ComponentKey } from "../../../../../i18n/types";
import placeholder1x1 from "../../../../../img/placeholder.1x1.png";
import { CartesApiException } from "../../../../../modules/jsonFetch";
import { getFileExtension, getImageSize, ImageSize } from "../../../../../utils";
import api from "../../../../api";
import { logoAction } from "../../ManageCommunity.locale";

import "../../../../../sass/components/buttons.scss";

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

const CommunityLogo: FC = () => {
    const context = useCommunityContext();
    const community = context.community!;

    const { t: tCommon } = useTranslation("Common");
    const { t: tValidation } = useTranslation("ManageCommunityValidations");
    const { t } = useTranslation("ManageCommunity");

    const [isValid, setIsValid] = useState<boolean>(false);
    useEffect(() => {
        setIsValid(false);

        if (community.logo_url) {
            fetch(community.logo_url).then((res) => {
                setIsValid(() => res.status === 200);
            });
        }
    }, [community]);

    const action: logoAction = useMemo(() => (isValid ? "modify" : "add"), [isValid]);

    // Boite modale, gestion de l'image
    const [modalImageUrl, setModalImageUrl] = useState<string>("");
    const logoDivRef = useRef(null);
    const logoIsHovered = useHover(logoDivRef);

    const queryClient = useQueryClient();

    // Ajout/modification du logo
    const updateLogoMutation = useMutation<{ logo_url: string }, CartesApiException>({
        mutationFn: () => {
            const form = new FormData();
            form.append("logo", upload);
            return api.community.updateLogo(community.id, form);
        },
        onSuccess: (response) => {
            AddLogoModal.close();

            queryClient.setQueryData<CommunityResponseDTO>(RQKeys.community(community.id), (community) =>
                community ? { ...community, logo_url: response.logo_url } : community
            );
        },
        onSettled: () => {
            reset();
        },
    });

    const { mutate: updateLogo, reset: resetUpdateLogo } = updateLogoMutation;

    // Suppression de la vignette
    const removeLogoMutation = useMutation<null, CartesApiException>({
        mutationFn: () => api.community.removeLogo(community.id),
        onSuccess: () => {
            queryClient.setQueryData<CommunityResponseDTO>(RQKeys.community(community.id), (community) =>
                community ? { ...community, logo_url: null } : community
            );
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
            updateLogo();
        }
    }, [updateLogo, upload]);

    // Boutons de la boite de dialogue
    const AddModalButtons: [ModalProps.ActionAreaButtonProps, ...ModalProps.ActionAreaButtonProps[]] = useMemo(() => {
        const btns: [ModalProps.ActionAreaButtonProps, ...ModalProps.ActionAreaButtonProps[]] = [
            {
                children: tCommon("cancel"),
                onClick: () => {
                    reset();
                    resetUpdateLogo();
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
    }, [action, resetUpdateLogo, handleSubmit, onSubmit, reset, t, tCommon]);

    return (
        <div className={fr.cx("fr-input-group")}>
            <label className={fr.cx("fr-label")}>{t("desc.logo")}</label>
            <div className={cx(fr.cx("fr-mt-1v"), "frx-community-logo")} aria-label={t("desc.logo.title")} title={t("desc.logo.title")} ref={logoDivRef}>
                <img
                    className={logoIsHovered ? "frx-btn--transparent fr-img--transparent-transition" : ""}
                    loading="lazy"
                    src={isValid ? (community.logo_url ?? placeholder1x1) : placeholder1x1}
                    onError={({ currentTarget }) => {
                        currentTarget.onerror = null; // prevents looping
                        currentTarget.src = placeholder1x1;
                    }}
                />
                {logoIsHovered && (
                    <div className="frx-btn--hover-icon">
                        <Button
                            title={t("logo_action", { action: action })}
                            iconId="fr-icon-edit-line"
                            priority="tertiary no outline"
                            onClick={AddLogoModal.open}
                        />
                        {isValid && (
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
            {removeLogoMutation.isError && (
                <Alert severity="error" closable title={tCommon("error")} description={removeLogoMutation.error.message} className={fr.cx("fr-my-3w")} />
            )}
            {removeLogoMutation.isPending && (
                <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                    <i className={fr.cx("fr-icon-refresh-line", "fr-icon--lg", "fr-mr-2v") + " frx-icon-spin"} />
                    <h6 className={fr.cx("fr-m-0")}>{t("running_action", { action: "delete" })}</h6>
                </div>
            )}
            {createPortal(
                <AddLogoModal.Component title={t("modal.logo.title")} buttons={AddModalButtons}>
                    <div className={fr.cx("fr-grid-row")}>
                        {updateLogoMutation.isError && (
                            <Alert
                                severity="error"
                                closable
                                title={tCommon("error")}
                                description={updateLogoMutation.error.message}
                                className={fr.cx("fr-my-3w")}
                            />
                        )}
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
                    {updateLogoMutation.isPending && (
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                            <i className={fr.cx("fr-icon-refresh-line", "fr-icon--lg", "fr-mr-2v") + " frx-icon-spin"} />
                            <h6 className={fr.cx("fr-m-0")}>{t("running_action", { action: action })}</h6>
                        </div>
                    )}
                </AddLogoModal.Component>,
                document.body
            )}
            <ConfirmDialog
                title={t("logo_confirm_delete_modal.title")}
                onConfirm={() => {
                    removeLogoMutation.mutate();
                }}
            />
        </div>
    );
};

export default memo(CommunityLogo);

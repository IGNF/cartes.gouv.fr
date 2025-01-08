import { fr } from "@codegouvfr/react-dsfr";
import Input from "@codegouvfr/react-dsfr/Input";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { Upload } from "@codegouvfr/react-dsfr/Upload";
import { yupResolver } from "@hookform/resolvers/yup";
import { TranslationFunction } from "i18nifty/typeUtils/TranslationFunction";
import { FC, useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { ComponentKey, useTranslation } from "../../../../../i18n/i18n";

import placeholder1x1 from "../../../../../img/placeholder.1x1.png";

import { appRoot } from "../../../../../router/router";
import "../../../../../sass/pages/espaceco/community.scss";
import { getThumbnail } from "../../../../esco_utils";

const AddDocumentDialogModal = createModal({
    id: "add-document-modal",
    isOpenedByDefault: false,
});

type AddDocumentDialogProps = {
    onAdd: (data: FormData) => void;
};

const AddDocumentDialog: FC<AddDocumentDialogProps> = ({ onAdd }) => {
    const { t: tCommon } = useTranslation("Common");
    const { t: tValid } = useTranslation("ManageCommunityValidations");
    const { t } = useTranslation("ManageCommunity");

    const getSchema = useCallback(
        (t: TranslationFunction<"ManageCommunityValidations", ComponentKey>) =>
            yup.object().shape({
                title: yup.string().min(10, t("description.modal.document.name.minlength")).required(t("description.modal.document.name.mandatory")),
                description: yup.string(),
                document: yup
                    .mixed()
                    .test({
                        name: "exists",
                        test(files, ctx) {
                            const file = files?.[0];
                            return file === undefined ? ctx.createError({ message: t("description.modal.document.file.mandatory") }) : true;
                        },
                    })
                    .test("check-file-size", t("description.modal.document.file.size_error"), (files) => {
                        const file = files?.[0];
                        if (file === undefined) return true;

                        const size = file.size / 1024 / 1024;
                        return size < 15;
                    })
                    .required(),
            }),
        []
    );

    const schema = getSchema(tValid);
    type FormType = yup.InferType<typeof schema>;

    const form = useForm<FormType>({
        mode: "onSubmit",
        resolver: yupResolver(schema),
    });

    const {
        register,
        watch,
        getValues: getFormValues,
        formState: { errors },
        handleSubmit,
        resetField,
    } = form;

    const clear = () => {
        resetField("title");
        resetField("description");
        resetField("document");
    };

    const onSubmit = () => {
        const values = getFormValues();

        const data = new FormData();
        data.append("title", values.title);
        data.append("description", values.description ?? "");
        data.append("document", values.document?.[0] as File);
        onAdd(data);
        clear();
    };

    const documentFile: File = watch("document")?.[0];
    const [modalImageUrl, setModalImageUrl] = useState<string>("");

    useEffect(() => {
        setModalImageUrl("");

        if (!documentFile) {
            return;
        }
        getThumbnail(appRoot, documentFile).then((uri) => {
            setModalImageUrl(uri ? uri : "");
        });
    }, [documentFile]);

    return (
        <>
            {createPortal(
                <AddDocumentDialogModal.Component
                    title={t("modal.document.title")}
                    buttons={[
                        {
                            children: tCommon("cancel"),
                            doClosesModal: false,
                            onClick: () => {
                                clear();
                                AddDocumentDialogModal.close();
                            },
                            priority: "secondary",
                        },
                        {
                            children: tCommon("add"),
                            doClosesModal: false,
                            onClick: handleSubmit(onSubmit),
                            priority: "primary",
                        },
                    ]}
                >
                    <div>
                        <Input
                            label={t("modal.document.title_field")}
                            state={errors.title ? "error" : "default"}
                            stateRelatedMessage={errors?.title?.message}
                            nativeInputProps={{
                                ...register("title"),
                            }}
                        />
                        <Input
                            label={t("modal.document.description")}
                            state={errors.description ? "error" : "default"}
                            stateRelatedMessage={errors?.description?.message}
                            textArea
                            nativeTextAreaProps={{
                                ...register("description"),
                                rows: 3,
                            }}
                        />
                        <div className={fr.cx("fr-grid-row")}>
                            <div className={fr.cx("fr-col-9")}>
                                <Upload
                                    hint={t("modal.document.file_hint")}
                                    className={fr.cx("fr-input-group")}
                                    state={errors.document ? "error" : "default"}
                                    stateRelatedMessage={errors?.document?.message}
                                    nativeInputProps={{
                                        ...register("document"),
                                    }}
                                />
                            </div>
                            <div className={cx(fr.cx("fr-col-3"), "frx-image-modal")}>
                                <div className={fr.cx("fr-grid-row", "fr-grid-row--right")}>
                                    <img src={modalImageUrl === "" ? placeholder1x1 : modalImageUrl} />
                                </div>
                            </div>
                        </div>
                    </div>
                </AddDocumentDialogModal.Component>,
                document.body
            )}
        </>
    );
};

export { AddDocumentDialog, AddDocumentDialogModal };

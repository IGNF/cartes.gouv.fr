import { fr } from "@codegouvfr/react-dsfr";
import Input from "@codegouvfr/react-dsfr/Input";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { Upload } from "@codegouvfr/react-dsfr/Upload";
import { yupResolver } from "@hookform/resolvers/yup";
import { TranslationFunction } from "i18nifty/typeUtils/TranslationFunction";
import { FC } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { ComponentKey, useTranslation } from "../../../../i18n/i18n";

type AddDocumentDialogProps = {
    onCancel: () => void;
    onAdd: (name: string, file: File) => void;
};

const AddDocumentDialogModal = createModal({
    id: "add-document-modal",
    isOpenedByDefault: false,
});

const AddDocumentDialog: FC<AddDocumentDialogProps> = ({ onCancel, onAdd }) => {
    const { t: tCommon } = useTranslation("Common");
    const { t: tValid } = useTranslation("ManageCommunityValidations");
    const { t } = useTranslation("ManageCommunity");

    const schema = (t: TranslationFunction<"ManageCommunityValidations", ComponentKey>) =>
        yup.object().shape({
            name: yup.string().min(7, t("description.modal.document.name.minlength")).required(t("description.modal.document.name.mandatory")),
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
                    return size < 5;
                }),
        });

    const form = useForm({
        mode: "onChange",
        resolver: yupResolver(schema(tValid)),
    });
    const {
        register,
        getValues: getFormValues,
        formState: { errors },
        handleSubmit,
        resetField,
    } = form;

    const clear = () => {
        resetField("name");
        resetField("document");
    };

    const onSubmit = () => {
        const values = getFormValues();
        onAdd(values.name, values.document?.[0] as File);
        clear();
    };

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
                                onCancel();
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
                            label={t("modal.document.name")}
                            state={errors.name ? "error" : "default"}
                            stateRelatedMessage={errors?.name?.message}
                            nativeInputProps={{
                                ...register("name"),
                            }}
                        />
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
                </AddDocumentDialogModal.Component>,
                document.body
            )}
        </>
    );
};

export { AddDocumentDialog, AddDocumentDialogModal };

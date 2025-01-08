import Input from "@codegouvfr/react-dsfr/Input";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { yupResolver } from "@hookform/resolvers/yup";
import { TranslationFunction } from "i18nifty/typeUtils/TranslationFunction";
import { FC, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { ComponentKey, useTranslation } from "../../../../../i18n/i18n";

import { DocumentFormType } from "../../../../../@types/app_espaceco";
import "../../../../../sass/pages/espaceco/community.scss";

const EditDocumentDialogModal = createModal({
    id: "edit-document-modal",
    isOpenedByDefault: false,
});

type EditDocumentDialogProps = {
    editDocument?: DocumentFormType;
    onModify: (data: object) => void;
};

const EditDocumentDialog: FC<EditDocumentDialogProps> = ({ editDocument, onModify }) => {
    const { t: tCommon } = useTranslation("Common");
    const { t: tValid } = useTranslation("ManageCommunityValidations");
    const { t } = useTranslation("ManageCommunity");

    const getSchema = useCallback(
        (t: TranslationFunction<"ManageCommunityValidations", ComponentKey>) =>
            yup.object().shape({
                title: yup.string().min(10, t("description.modal.document.name.minlength")).required(t("description.modal.document.name.mandatory")),
                description: yup.string(),
            }),
        []
    );

    const schema = getSchema(tValid);
    type FormType = yup.InferType<typeof schema>;

    const originalValues = useMemo(() => {
        return editDocument
            ? {
                  title: editDocument.title,
                  description: editDocument.description ?? "",
              }
            : { title: "", description: "" };
    }, [editDocument]);

    const form = useForm<FormType>({
        mode: "onChange",
        resolver: yupResolver(schema),
        values: originalValues,
    });

    const {
        register,
        getValues: getFormValues,
        formState: { errors },
        handleSubmit,
        resetField,
    } = form;

    const clear = () => {
        resetField("title");
        resetField("description");
    };

    const onSubmit = () => {
        const formValues = getFormValues();

        const body = {};
        if (formValues.title !== originalValues.title) {
            body["title"] = formValues.title;
        }
        if (formValues.description !== originalValues.description) {
            body["description"] = originalValues.description;
        }

        if (Object.keys(body).length) {
            onModify(body);
        }
        clear();
    };

    return (
        <>
            {createPortal(
                <EditDocumentDialogModal.Component
                    title={t("modal.document.title")}
                    buttons={[
                        {
                            children: tCommon("cancel"),
                            doClosesModal: false,
                            onClick: () => {
                                clear();
                                EditDocumentDialogModal.close();
                            },
                            priority: "secondary",
                        },
                        {
                            children: tCommon("modify"),
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
                    </div>
                </EditDocumentDialogModal.Component>,
                document.body
            )}
        </>
    );
};

export { EditDocumentDialog, EditDocumentDialogModal };

import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { Upload } from "@codegouvfr/react-dsfr/Upload";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, memo, useEffect } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import * as yup from "yup";

import { DatasheetDocumentTypeEnum } from "../../../../../@types/app";
import LoadingText from "../../../../../components/Utils/LoadingText";
import Wait from "../../../../../components/Utils/Wait";
import { useTranslation } from "../../../../../i18n/i18n";
import RQKeys from "../../../../../modules/entrepot/RQKeys";
import { getFileExtension } from "../../../../../utils";
import api from "../../../../api";
import DocumentsListItem from "./DocumentsListItem";

const documentAddModal = createModal({
    id: "datasheet-document-add-modal",
    isOpenedByDefault: false,
});

const ACCEPTED_FILE_EXTENSIONS = ["qgz", "pdf"];
const MAX_FILE_SIZE = 5;

type DocumentsTabProps = {
    datasheetName: string;
    datastoreId: string;
};

const DocumentsTab: FC<DocumentsTabProps> = ({ datastoreId, datasheetName }) => {
    const { t } = useTranslation("DatasheetView");
    const { t: tCommon } = useTranslation("Common");

    const schema = yup.object().shape({
        type: yup.string<DatasheetDocumentTypeEnum>().required(),
        name: yup.string().typeError(t("documents_tab.add_document.error.name_required")).required(t("documents_tab.add_document.error.name_required")),
        description: yup.string(),
        document: yup.lazy(() => {
            switch (documentType) {
                case DatasheetDocumentTypeEnum.Link:
                    return yup.string().url(t("documents_tab.add_document.error.url_invalid")).required(t("documents_tab.add_document.error.url_required"));

                case DatasheetDocumentTypeEnum.File:
                    return yup.mixed().test({
                        name: "is-valid-document",
                        async test(files, ctx) {
                            const file = files?.[0] ?? undefined;
                            if (file === undefined) {
                                return ctx.createError({
                                    message: t("documents_tab.add_document.error.file_required"),
                                });
                            }

                            const fileExtension = getFileExtension(file.name);
                            if (fileExtension === undefined) {
                                return ctx.createError({
                                    message: t("documents_tab.add_document.error.extension_missing"),
                                });
                            }

                            if (!ACCEPTED_FILE_EXTENSIONS.includes(fileExtension)) {
                                return ctx.createError({
                                    message: t("documents_tab.add_document.error.extention_incorrect", {
                                        fileExtension,
                                        acceptedExtensions: [...ACCEPTED_FILE_EXTENSIONS],
                                    }),
                                });
                            }

                            const size = file.size / 1024 / 1024; // taille en Mo
                            if (size > MAX_FILE_SIZE) {
                                return ctx.createError({
                                    message: t("documents_tab.add_document.error.file_too_large", { maxFileSize: MAX_FILE_SIZE }),
                                });
                            }

                            return true;
                        },
                    });

                case undefined:
                case null:
                default:
                    return yup.object().notRequired();
            }
        }),
    });

    const {
        register,
        getValues: getFormValues,
        formState: { errors },
        reset: resetForm,
        resetField: resetFormField,
        clearErrors,
        watch,
        handleSubmit,
    } = useForm({
        resolver: yupResolver(schema),
        mode: "onChange",
    });

    const documentType = watch("type");

    const onSubmit = () => {
        const formValues = getFormValues();

        const formData = new FormData();
        formData.set("type", formValues.type);
        formData.set("name", formValues.name);

        if (formValues.description !== undefined) {
            formData.set("description", formValues.description);
        }

        if (typeof formValues.document === "string") {
            formData.set("document", formValues.document);
        }

        if (formValues.document instanceof FileList) {
            formData.set("document", formValues.document[0]);
        }

        addDocumentMutation.mutate(formData);
    };

    useEffect(() => {
        clearErrors("document");
        resetFormField("document");
    }, [documentType, clearErrors, resetFormField]);

    const queryClient = useQueryClient();

    const documentsListQuery = useQuery({
        queryKey: RQKeys.datastore_datasheet_documents_list(datastoreId, datasheetName),
        queryFn: ({ signal }) => api.datasheetDocument.getList(datastoreId, datasheetName, { signal }),
        staleTime: 60000,
    });

    const addDocumentMutation = useMutation({
        mutationFn: (formData: FormData) => api.datasheetDocument.add(datastoreId, datasheetName, formData),
        onMutate: () => {
            documentAddModal.close();
        },
        onSettled: () => {
            resetForm();
        },
        onSuccess: (data) => {
            queryClient.setQueryData(RQKeys.datastore_datasheet_documents_list(datastoreId, datasheetName), () => data);
        },
    });

    return (
        <>
            <div className={fr.cx("fr-grid-row", "fr-grid-row--right", "fr-grid-row--middle")}>
                <Button
                    iconId="fr-icon-add-line"
                    onClick={() => {
                        resetForm();
                        documentAddModal.open();
                    }}
                >
                    {t("documents_tab.add_document")}
                </Button>
            </div>

            {addDocumentMutation.isError && (
                <Alert severity="error" closable title={tCommon("error")} description={addDocumentMutation.error.message} className={fr.cx("fr-my-3w")} />
            )}

            {documentsListQuery.data?.length !== undefined && documentsListQuery.data?.length > 0
                ? documentsListQuery.data.map((document) => (
                      <DocumentsListItem key={document.id} document={document} datastoreId={datastoreId} datasheetName={datasheetName} />
                  ))
                : t("documents_tab.list.no_documents")}

            {createPortal(
                <documentAddModal.Component
                    title={t("documents_tab.add_document")}
                    buttons={[
                        {
                            children: tCommon("cancel"),
                            priority: "secondary",
                            doClosesModal: true,
                            onClick: () => resetForm(),
                        },
                        {
                            children: tCommon("validate"),
                            onClick: handleSubmit(onSubmit),
                            priority: "primary",
                            doClosesModal: false,
                            disabled: documentType === undefined || documentType === null,
                        },
                    ]}
                    size="large"
                    concealingBackdrop={false}
                >
                    <div className={fr.cx("fr-container")}>
                        <div className={fr.cx("fr-grid-row")}>
                            <div className={fr.cx("fr-col-12")}>
                                <RadioButtons
                                    legend={t("documents_tab.add_document.type.label")}
                                    orientation="horizontal"
                                    options={Object.values(DatasheetDocumentTypeEnum).map((docType) => ({
                                        label: t("documents_tab.add_document.type.options.label", { docType }),
                                        nativeInputProps: {
                                            ...register("type"),
                                            value: docType,
                                        },
                                    }))}
                                    state={errors.type?.message !== undefined ? "error" : "default"}
                                    stateRelatedMessage={errors.type?.message}
                                />

                                {documentType !== undefined && documentType !== null && (
                                    <>
                                        <Input
                                            label={t("documents_tab.add_document.name.label")}
                                            nativeInputProps={{
                                                ...register("name"),
                                            }}
                                            state={errors.name?.message !== undefined ? "error" : "default"}
                                            stateRelatedMessage={errors.name?.message}
                                        />

                                        <Input
                                            label={t("documents_tab.add_document.description.label")}
                                            nativeInputProps={{
                                                ...register("description"),
                                            }}
                                            state={errors.description?.message !== undefined ? "error" : "default"}
                                            stateRelatedMessage={errors.description?.message}
                                        />

                                        {(() => {
                                            switch (documentType) {
                                                case DatasheetDocumentTypeEnum.File:
                                                    return (
                                                        <Upload
                                                            label={t("documents_tab.add_document.file.label")}
                                                            hint={t("documents_tab.add_document.file.hint", {
                                                                acceptedExtensions: [...ACCEPTED_FILE_EXTENSIONS],
                                                            })}
                                                            multiple={false}
                                                            nativeInputProps={{
                                                                accept: ACCEPTED_FILE_EXTENSIONS.map((ext) => `.${ext}`).join(","),
                                                                ...register("document"),
                                                            }}
                                                            state={errors.document?.message !== undefined ? "error" : "default"}
                                                            stateRelatedMessage={errors.document?.message}
                                                            className={fr.cx("fr-input-group")}
                                                        />
                                                    );

                                                case DatasheetDocumentTypeEnum.Link:
                                                    return (
                                                        <Input
                                                            label={t("documents_tab.add_document.link.label")}
                                                            nativeInputProps={{
                                                                placeholder: "https://www.youtube.com/watch?v=Sayp57DPiYo",
                                                                ...register("document"),
                                                            }}
                                                            state={errors.document?.message !== undefined ? "error" : "default"}
                                                            stateRelatedMessage={errors.document?.message}
                                                        />
                                                    );
                                            }
                                        })()}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </documentAddModal.Component>,
                document.body
            )}

            {addDocumentMutation.isPending && (
                <Wait>
                    <div className={fr.cx("fr-grid-row")}>
                        <LoadingText as="h6" message={t("documents_tab.add_document.in_progress")} withSpinnerIcon={true} />
                    </div>
                </Wait>
            )}
        </>
    );
};

export default memo(DocumentsTab);

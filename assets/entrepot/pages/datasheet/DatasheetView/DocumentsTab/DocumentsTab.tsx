import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import Table from "@codegouvfr/react-dsfr/Table";
import { Upload } from "@codegouvfr/react-dsfr/Upload";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, memo, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import * as yup from "yup";

import { type DatasheetDocument, DatasheetDocumentTypeEnum } from "../../../../../@types/app";
import LoadingText from "../../../../../components/Utils/LoadingText";
import Wait from "../../../../../components/Utils/Wait";
import { useTranslation } from "../../../../../i18n/i18n";
import RQKeys from "../../../../../modules/entrepot/RQKeys";
import { getFileExtension } from "../../../../../utils";
import api from "../../../../api";

const uploadDocumentModal = createModal({
    id: "upload-document-modal",
    isOpenedByDefault: false,
});

const confirmDeleteDocumentModal = createModal({
    id: "confirm-delete-datasheet-document-modal",
    isOpenedByDefault: false,
});

type DocumentsTabProps = {
    datasheetName: string;
    datastoreId: string;
};

const DocumentsTab: FC<DocumentsTabProps> = ({ datastoreId, datasheetName }) => {
    const { t } = useTranslation("DatasheetView");
    const { t: tCommon } = useTranslation("Common");

    const [currentDocument, setCurrentDocument] = useState<DatasheetDocument>();

    const schema = yup.object().shape({
        type: yup.string<DatasheetDocumentTypeEnum>().required(),
        name: yup.string().typeError(t("documents_tab.add_document.error.name_required")).required(t("documents_tab.add_document.error.name_required")),
        document: yup.lazy(() => {
            if (documentType === undefined || documentType === null) {
                return yup.object().notRequired();
            }

            if (documentType === DatasheetDocumentTypeEnum.VideoLink) {
                return yup.string().url(t("documents_tab.add_document.error.url_invalid")).required(t("documents_tab.add_document.error.url_required"));
            }

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

                    let expectedExtension: string | null = null;
                    switch (documentType) {
                        case DatasheetDocumentTypeEnum.Pdf:
                            expectedExtension = "pdf";
                            break;
                        case DatasheetDocumentTypeEnum.QgisProject:
                            expectedExtension = "qgz";
                            break;
                    }
                    if (expectedExtension && fileExtension !== expectedExtension) {
                        return ctx.createError({
                            message: t("documents_tab.add_document.error.extention_incorrect", { fileExtension, expectedExtension }),
                        });
                    }

                    const MAX_FILE_SIZE = 5;
                    const size = file.size / 1024 / 1024; // taille en Mo
                    if (size > MAX_FILE_SIZE) {
                        return ctx.createError({
                            message: t("documents_tab.add_document.error.file_too_large", { maxFileSize: MAX_FILE_SIZE }),
                        });
                    }

                    return true;
                },
            });
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
        staleTime: 20000,
    });

    const addDocumentMutation = useMutation({
        mutationFn: (formData: FormData) => api.datasheetDocument.add(datastoreId, datasheetName, formData),
        onMutate: () => {
            uploadDocumentModal.close();
        },
        onSettled: () => {
            resetForm();
        },
        onSuccess: (data) => {
            queryClient.setQueryData(RQKeys.datastore_datasheet_documents_list(datastoreId, datasheetName), () => data);
        },
    });

    const deleteDocumentMutation = useMutation({
        mutationFn: () => {
            if (currentDocument?.id) return api.datasheetDocument.remove(datastoreId, datasheetName, currentDocument.id);
            return Promise.reject();
        },
        onMutate: () => {
            confirmDeleteDocumentModal.close();
        },
        onSuccess: () => {
            queryClient.setQueryData(RQKeys.datastore_datasheet_documents_list(datastoreId, datasheetName), (documentList: DatasheetDocument[]) =>
                documentList.filter((doc) => doc.id !== currentDocument?.id)
            );
            setCurrentDocument(undefined);
        },
    });

    return (
        <>
            <div className={fr.cx("fr-grid-row", "fr-grid-row--right", "fr-grid-row--middle")}>
                <Button
                    iconId="fr-icon-add-line"
                    onClick={() => {
                        resetForm();
                        uploadDocumentModal.open();
                    }}
                >
                    {t("documents_tab.add_document")}
                </Button>
            </div>

            {addDocumentMutation.isError && (
                <Alert severity="error" closable title={tCommon("error")} description={addDocumentMutation.error.message} className={fr.cx("fr-my-3w")} />
            )}

            {documentsListQuery.data?.length !== undefined && documentsListQuery.data?.length > 0 ? (
                <div className={fr.cx("fr-grid-row")}>
                    <div className={fr.cx("fr-col-12")}>
                        <Table
                            data={documentsListQuery.data?.map((doc) => [
                                doc.name,
                                <a key={doc.id} href={doc.url} target="_blank" rel="noreferrer">
                                    {doc.url}
                                </a>,
                                t("documents_tab.document_type.options.label", { docType: doc.type }),
                                <Button
                                    key={doc.id}
                                    priority="tertiary no outline"
                                    iconId="fr-icon-delete-line"
                                    onClick={() => {
                                        setCurrentDocument(doc);
                                        confirmDeleteDocumentModal.open();
                                    }}
                                >
                                    {tCommon("delete")}
                                </Button>,
                            ])}
                            headers={["Nom du document", "Lien", t("documents_tab.document_type.label"), ""]}
                            bordered={false}
                        />
                    </div>
                </div>
            ) : (
                t("documents_tab.no_documents")
            )}

            {createPortal(
                <uploadDocumentModal.Component
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
                                    legend={t("documents_tab.document_type.label")}
                                    orientation="horizontal"
                                    options={Object.values(DatasheetDocumentTypeEnum).map((docType) => ({
                                        label: t("documents_tab.document_type.options.label", { docType }),
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

                                        {(() => {
                                            switch (documentType) {
                                                case DatasheetDocumentTypeEnum.VideoLink:
                                                    return (
                                                        <Input
                                                            label={t("documents_tab.add_document.video_link.label")}
                                                            nativeInputProps={{
                                                                placeholder: "https://www.youtube.com/watch?v=Sayp57DPiYo",
                                                                ...register("document"),
                                                            }}
                                                            state={errors.document?.message !== undefined ? "error" : "default"}
                                                            stateRelatedMessage={errors.document?.message}
                                                        />
                                                    );

                                                case DatasheetDocumentTypeEnum.Pdf:
                                                    return (
                                                        <Upload
                                                            label={t("documents_tab.add_document.pdf.label")}
                                                            hint={t("documents_tab.add_document.pdf.hint")}
                                                            multiple={false}
                                                            nativeInputProps={{
                                                                accept: ".pdf",
                                                                ...register("document"),
                                                            }}
                                                            state={errors.document?.message !== undefined ? "error" : "default"}
                                                            stateRelatedMessage={errors.document?.message}
                                                            className={fr.cx("fr-input-group")}
                                                        />
                                                    );

                                                case DatasheetDocumentTypeEnum.QgisProject:
                                                    return (
                                                        <Upload
                                                            label={t("documents_tab.add_document.qgis_project.label")}
                                                            hint={t("documents_tab.add_document.qgis_project.hint")}
                                                            multiple={false}
                                                            nativeInputProps={{
                                                                accept: ".qgz",
                                                                ...register("document"),
                                                            }}
                                                            state={errors.document?.message !== undefined ? "error" : "default"}
                                                            stateRelatedMessage={errors.document?.message}
                                                            className={fr.cx("fr-input-group")}
                                                        />
                                                    );
                                            }
                                        })()}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </uploadDocumentModal.Component>,
                document.body
            )}

            {addDocumentMutation.isPending && (
                <Wait>
                    <div className={fr.cx("fr-grid-row")}>
                        <LoadingText as="h6" message={t("documents_tab.add_document.in_progress")} withSpinnerIcon={true} />
                    </div>
                </Wait>
            )}

            {createPortal(
                <confirmDeleteDocumentModal.Component
                    title={t("documents_tab.delete_document.confirmation", {
                        display: `${currentDocument?.name} (${currentDocument?.url})`,
                    })}
                    buttons={[
                        {
                            children: tCommon("no"),
                            priority: "secondary",
                        },
                        {
                            children: tCommon("yes"),
                            onClick: () => {
                                if (currentDocument?.id !== undefined) {
                                    deleteDocumentMutation.mutate();
                                }
                            },
                            priority: "primary",
                        },
                    ]}
                    size="large"
                >
                    <div />
                </confirmDeleteDocumentModal.Component>,
                document.body
            )}

            {deleteDocumentMutation.isPending && (
                <Wait>
                    <div className={fr.cx("fr-grid-row")}>
                        <LoadingText as="h6" message={t("documents_tab.delete_document.in_progress")} withSpinnerIcon={true} />
                    </div>
                </Wait>
            )}
        </>
    );
};

export default memo(DocumentsTab);

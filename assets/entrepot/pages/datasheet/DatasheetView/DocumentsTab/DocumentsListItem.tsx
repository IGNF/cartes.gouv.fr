import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FC } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import * as yup from "yup";

import { DatasheetDocument } from "../../../../../@types/app";
import LoadingText from "../../../../../components/Utils/LoadingText";
import MenuList from "../../../../../components/Utils/MenuList";
import Wait from "../../../../../components/Utils/Wait";
import { useTranslation } from "../../../../../i18n/i18n";
import RQKeys from "../../../../../modules/entrepot/RQKeys";
import api from "../../../../api";

type DocumentsListItemProps = {
    document: DatasheetDocument;
    datastoreId: string;
    datasheetName: string;
};

const DocumentsListItem: FC<DocumentsListItemProps> = ({ document, datastoreId, datasheetName }) => {
    const { t } = useTranslation("DatasheetView");
    const { t: tCommon } = useTranslation("Common");

    const schema = yup.object().shape({
        name: yup.string().typeError(t("documents_tab.add_document.error.name_required")).required(t("documents_tab.add_document.error.name_required")),
        description: yup.string(),
    });

    const {
        register,
        getValues: getFormValues,
        formState: { errors },
        reset: resetForm,
        handleSubmit,
    } = useForm({
        resolver: yupResolver(schema),
        mode: "onChange",
        values: {
            name: document.name,
            description: document.description,
        },
    });

    const queryClient = useQueryClient();

    const documentEditModal = createModal({
        id: `datasheet-document-edit-modal-${document.id}`,
        isOpenedByDefault: false,
    });

    const confirmDeleteDocumentModal = createModal({
        id: `confirm-delete-datasheet-document-modal-${document.id}`,
        isOpenedByDefault: false,
    });

    const onSubmit = () => {
        const formValues = getFormValues();
        editDocumentMutation.mutate(formValues);
    };

    const editDocumentMutation = useMutation({
        mutationFn: (formData: object) => api.datasheetDocument.edit(datastoreId, datasheetName, document.id, formData),
        onSettled: () => {
            resetForm();
        },
        onSuccess: (data) => {
            queryClient.setQueryData(RQKeys.datastore_datasheet_documents_list(datastoreId, datasheetName), () => data);
        },
    });

    const deleteDocumentMutation = useMutation({
        mutationFn: () => api.datasheetDocument.remove(datastoreId, datasheetName, document.id),
        onMutate: () => {
            confirmDeleteDocumentModal.close();
        },
        onSuccess: () => {
            queryClient.setQueryData(RQKeys.datastore_datasheet_documents_list(datastoreId, datasheetName), (documentList: DatasheetDocument[]) =>
                documentList.filter((doc) => doc.id !== document?.id)
            );
        },
    });

    return (
        <>
            <div className={fr.cx("fr-p-2v", "fr-mt-2v")} style={{ backgroundColor: fr.colors.decisions.background.contrast.grey.default }}>
                {editDocumentMutation.isError && (
                    <div className={fr.cx("fr-grid-row")}>
                        <div className={fr.cx("fr-col-12")}>
                            <Alert
                                severity="error"
                                closable
                                title={tCommon("error")}
                                description={editDocumentMutation.error.message}
                                className={fr.cx("fr-my-3w")}
                            />
                        </div>
                    </div>
                )}

                {deleteDocumentMutation.isError && (
                    <div className={fr.cx("fr-grid-row")}>
                        <div className={fr.cx("fr-col-12")}>
                            <Alert
                                severity="error"
                                closable
                                title={tCommon("error")}
                                description={deleteDocumentMutation.error.message}
                                className={fr.cx("fr-my-3w")}
                            />
                        </div>
                    </div>
                )}

                <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                    <div className={fr.cx("fr-col-12", "fr-col-md-6")}>
                        <p className={fr.cx("fr-mb-1v")}>{document.name}</p>
                        <p className={fr.cx("fr-text--sm", "fr-text--light", "fr-m-0")}>{document.description ?? ""}</p>
                    </div>
                    <div className={fr.cx("fr-col-12", "fr-col-md-2")}>{t("documents_tab.list.document_type", { doc: document })}</div>
                    <div className={fr.cx("fr-col-12", "fr-col-md-4")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--right", "fr-grid-row--middle")}>
                            <Button
                                className={fr.cx("fr-mr-2v")}
                                linkProps={{ href: document.url, target: "_blank", rel: "noreferrer", title: tCommon("see") + " - " + tCommon("new_window") }}
                                priority="secondary"
                            >
                                {tCommon("see")}
                            </Button>
                            <MenuList
                                menuOpenButtonProps={{
                                    iconId: "fr-icon-menu-2-fill",
                                    title: "Autres actions",
                                    priority: "secondary",
                                }}
                                items={[
                                    {
                                        text: tCommon("modify"),
                                        iconId: "ri-edit-box-line",
                                        onClick: documentEditModal.open,
                                    },
                                    {
                                        text: tCommon("delete"),
                                        iconId: "fr-icon-delete-line",
                                        onClick: confirmDeleteDocumentModal.open,
                                    },
                                ]}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {createPortal(
                <documentEditModal.Component
                    title={t("documents_tab.edit_document", {
                        name: document.name,
                    })}
                    buttons={[
                        {
                            children: tCommon("cancel"),
                            priority: "secondary",
                            doClosesModal: true,
                            onClick: () => {
                                resetForm();
                            },
                        },
                        {
                            children: tCommon("validate"),
                            onClick: handleSubmit(onSubmit),
                            priority: "primary",
                            doClosesModal: false,
                        },
                    ]}
                    size="large"
                    concealingBackdrop={false}
                >
                    <div className={fr.cx("fr-container")}>
                        <div className={fr.cx("fr-grid-row")}>
                            <div className={fr.cx("fr-col-12")}>
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
                            </div>
                        </div>
                    </div>
                </documentEditModal.Component>,
                window.document.body
            )}

            {editDocumentMutation.isPending && (
                <Wait>
                    <div className={fr.cx("fr-grid-row")}>
                        <LoadingText as="h6" message={t("documents_tab.edit_document.in_progress")} withSpinnerIcon={true} />
                    </div>
                </Wait>
            )}

            {createPortal(
                <confirmDeleteDocumentModal.Component
                    title={t("documents_tab.delete_document.confirmation", {
                        display: `${document?.name} (${document?.url})`,
                    })}
                    buttons={[
                        {
                            children: tCommon("no"),
                            priority: "secondary",
                        },
                        {
                            children: tCommon("yes"),
                            onClick: () => {
                                if (document?.id !== undefined) {
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
                window.document.body
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

export default DocumentsListItem;

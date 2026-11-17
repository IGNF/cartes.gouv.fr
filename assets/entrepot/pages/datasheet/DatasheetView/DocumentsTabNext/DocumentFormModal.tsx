import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Input from "@codegouvfr/react-dsfr/Input";
import { type createModal } from "@codegouvfr/react-dsfr/Modal";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import { Upload } from "@codegouvfr/react-dsfr/Upload";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";

import { type DatasheetDocument, DatasheetDocumentTypeEnum } from "@/@types/app";
import LoadingText from "@/components/Utils/LoadingText";
import Wait from "@/components/Utils/Wait";
import api from "@/entrepot/api";
import { useTranslation } from "@/i18n";
import { getApiErrorMessage } from "@/modules/apiError";
import RQKeys from "@/modules/entrepot/RQKeys";
import { type ApiError } from "@/modules/jsonFetch";
import { setApiFormErrors } from "@/modules/setApiFormErrors";
import {
    buildDocumentFormData,
    buildDocumentFormSchema,
    DOCUMENT_FILE_EXTENSIONS,
    DOCUMENT_MAX_SIZE_MB,
    type DocumentFormMode,
    type DocumentFormOutput,
    type DocumentFormValues,
} from "./documentFormSchema";

/** ajout d’un document ou d’un lien, ou modification de `document` */
export type DocumentFormTarget = { mode: DocumentFormMode; document?: DatasheetDocument };

const DEFAULT_TARGET: DocumentFormTarget = { mode: { type: DatasheetDocumentTypeEnum.File, editing: false } };

type DocumentFormModalProps = {
    modal: ReturnType<typeof createModal>;
    datastoreId: string;
    datasheetName: string;
    /** nouvel objet à chaque ouverture : le formulaire repart de ses valeurs */
    target?: DocumentFormTarget;
};

export default function DocumentFormModal({ modal, datastoreId, datasheetName, target = DEFAULT_TARGET }: DocumentFormModalProps) {
    const { t } = useTranslation("DocumentsTabNext");
    const queryClient = useQueryClient();
    const { mode, document: editedDocument } = target;
    const isLink = mode.type === DatasheetDocumentTypeEnum.Link;

    const schema = useMemo(() => buildDocumentFormSchema(t, mode), [t, mode]);
    const values = useMemo<DocumentFormValues>(() => ({ name: target.document?.name ?? "", url: target.document?.url ?? "", file: undefined }), [target]);
    const form = useForm<DocumentFormValues, unknown, DocumentFormOutput>({ resolver: zodResolver(schema), values });
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = form;

    const saveMutation = useMutation<DatasheetDocument[], ApiError, FormData>({
        mutationFn: (formData) =>
            editedDocument
                ? api.datasheetDocument.edit(datastoreId, datasheetName, editedDocument.id, formData)
                : api.datasheetDocument.add(datastoreId, datasheetName, formData),
        onSuccess: (documents) => {
            queryClient.setQueryData(RQKeys.datastore_datasheet_documents_list(datastoreId, datasheetName), documents);
            modal.close();
        },
        onError: (error) => setApiFormErrors(error, form.setError),
    });

    useIsModalOpen(modal, {
        onConceal: () => {
            form.reset(values);
            saveMutation.reset();
        },
    });

    const title = editedDocument ? (isLink ? t("modal.edit_link") : t("modal.edit_file")) : isLink ? t("modal.add_link") : t("modal.add_file");
    // erreur sans champ (Entrepôt, réseau) : affichée en tête de la modale
    const showGlobalError = saveMutation.isError && Object.keys(errors).length === 0;

    return (
        <>
            {createPortal(
                <modal.Component
                    title={title}
                    buttons={[
                        { children: t("cancel"), priority: "secondary", doClosesModal: true },
                        {
                            children: editedDocument ? t("submit_edit") : t("submit_add"),
                            doClosesModal: false,
                            onClick: () => void handleSubmit((output) => saveMutation.mutate(buildDocumentFormData(output, mode)))(),
                        },
                    ]}
                >
                    {showGlobalError && (
                        <Alert
                            className={fr.cx("fr-mb-2w")}
                            severity="error"
                            title={t("save_error")}
                            description={getApiErrorMessage(saveMutation.error)}
                            small
                        />
                    )}
                    <Input
                        label={isLink ? t("field.link_name") : t("field.file_name")}
                        nativeInputProps={register("name")}
                        state={errors.name ? "error" : "default"}
                        stateRelatedMessage={errors.name?.message}
                    />
                    {isLink ? (
                        <Input
                            label={t("field.url")}
                            nativeInputProps={{ ...register("url"), type: "url" }}
                            state={errors.url ? "error" : "default"}
                            stateRelatedMessage={errors.url?.message}
                        />
                    ) : (
                        <Upload
                            label={editedDocument ? t("field.file_replace") : t("field.file")}
                            hint={t("field.file_hint", { max: DOCUMENT_MAX_SIZE_MB })}
                            multiple={false}
                            nativeInputProps={{ ...register("file"), accept: DOCUMENT_FILE_EXTENSIONS.map((ext) => `.${ext}`).join(",") }}
                            state={errors.file ? "error" : "default"}
                            stateRelatedMessage={errors.file?.message}
                        />
                    )}
                </modal.Component>,
                window.document.body
            )}

            {saveMutation.isPending && (
                <Wait>
                    <LoadingText as="h6" message={t("saving")} withSpinnerIcon={true} />
                </Wait>
            )}
        </>
    );
}

import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import Table from "@codegouvfr/react-dsfr/Table";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FC, ReactNode, useCallback, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { v4 as uuidv4 } from "uuid";
import { DocumentDTO } from "../../../../../@types/espaceco";
import LoadingText from "../../../../../components/Utils/LoadingText";
import Wait from "../../../../../components/Utils/Wait";
import thumbnails from "../../../../../data/doc_thumbnail.json";
import { useTranslation } from "../../../../../i18n/i18n";
import RQKeys from "../../../../../modules/espaceco/RQKeys";
import { CartesApiException } from "../../../../../modules/jsonFetch";
import { appRoot } from "../../../../../router/router";
import { useSnackbarStore } from "../../../../../stores/SnackbarStore";
import { getFileExtension } from "../../../../../utils";
import api from "../../../../api";
import { AddDocumentDialog, AddDocumentDialogModal } from "./AddDocumentDialog";
import { EditDocumentDialog, EditDocumentDialogModal } from "./EditDocumentDialog";

type DocumentListProps = {
    communityId: number;
    documents: DocumentDTO[];
};

const ConfirmRemoveDocumentDialogModal = createModal({
    id: `confirm-delete-document-${uuidv4()}`,
    isOpenedByDefault: false,
});

const DocumentList: FC<DocumentListProps> = ({ communityId, documents }) => {
    const { t: tCommon } = useTranslation("Common");
    const { t } = useTranslation("ManageCommunity");

    const setMessage = useSnackbarStore((state) => state.setMessage);
    const [currentDocument, setCurrentDocument] = useState<DocumentDTO | undefined>();

    const copyToClipboard = useCallback(
        (uri) => {
            navigator.clipboard.writeText(uri);
            setMessage(tCommon("url_copied"));
        },
        [tCommon, setMessage]
    );

    const getThumbnail = useCallback((fileName: string) => {
        const extension = getFileExtension(fileName);

        let src = thumbnails.defaut;
        if (extension) {
            src = thumbnails[extension].src;
        }
        return `${appRoot}/${src}`;
    }, []);

    const queryClient = useQueryClient();

    const addDocumentMutation = useMutation<DocumentDTO, CartesApiException, FormData>({
        mutationFn: (data) => api.communityDocuments.add(communityId, data),
        onSuccess: (document) => {
            queryClient.setQueryData<DocumentDTO[]>(RQKeys.communityDocuments(communityId), (oldDocuments) => {
                const documents = oldDocuments ? [...oldDocuments] : [];
                documents.push(document);
                return documents;
            });
        },
    });

    const updateDocumentMutation = useMutation<DocumentDTO, CartesApiException, object>({
        mutationFn: (data) => {
            if (currentDocument) {
                return api.communityDocuments.update(communityId, currentDocument.id, data);
            }
            return Promise.reject();
        },
        onSuccess: (document) => {
            queryClient.setQueryData<DocumentDTO[]>(RQKeys.communityDocuments(communityId), (oldDocuments) => {
                const documents = oldDocuments ? [...oldDocuments] : [];

                const index = documents.findIndex((d) => d.id === document.id);
                if (index >= 0) {
                    documents[index] = { ...document };
                }
                return documents;
            });
        },
        onSettled: () => setCurrentDocument(undefined),
    });

    const removeDocumentMutation = useMutation<DocumentDTO, CartesApiException>({
        mutationFn: () => {
            if (currentDocument) {
                return api.communityDocuments.remove(communityId, currentDocument.id);
            }
            return Promise.reject();
        },
        onSuccess: () => {
            queryClient.setQueryData<DocumentDTO[]>(RQKeys.communityDocuments(communityId), (oldDocuments) => {
                const documents = oldDocuments ? [...oldDocuments] : [];
                return documents.filter((d) => d.id !== currentDocument?.id);
            });
        },
        onSettled: () => setCurrentDocument(undefined),
    });

    const datas: ReactNode[][] = useMemo(() => {
        return documents.map((d) => {
            const element = d.uri ? (
                <img className={"frx-document-image"} src={d.uri} />
            ) : (
                <img className={"frx-document-image"} src={getThumbnail(d.short_fileName)} />
            );
            return [
                <div key={d.id} className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                    {element}
                    <span className={fr.cx("fr-ml-1v")}>{d.title}</span>
                </div>,
                <div key={d.id} className={fr.cx("fr-grid-row")}>
                    {d.description}
                </div>,
                <div key={d.id} className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-grid-row--right")}>
                    {d.uri && (
                        <Button
                            title={tCommon("copy_to_clipboard")}
                            priority={"tertiary no outline"}
                            iconId={"ri-file-copy-2-line"}
                            onClick={() => {
                                copyToClipboard(d.uri);
                            }}
                        />
                    )}
                    <Button
                        title={tCommon("download")}
                        priority={"tertiary no outline"}
                        iconId={"fr-icon-download-line"}
                        linkProps={{
                            href: d.download_uri,
                            target: "_blank",
                            rel: "noreferrer",
                        }}
                    />
                    <Button
                        title={tCommon("modify")}
                        priority={"tertiary no outline"}
                        iconId={"fr-icon-edit-line"}
                        onClick={() => {
                            setCurrentDocument(d);
                            EditDocumentDialogModal.open();
                        }}
                    />
                    <Button
                        title={tCommon("delete")}
                        priority={"tertiary no outline"}
                        iconId={"fr-icon-delete-line"}
                        onClick={() => {
                            setCurrentDocument(d);
                            ConfirmRemoveDocumentDialogModal.open();
                        }}
                    />
                </div>,
            ];
        });
    }, [tCommon, documents, getThumbnail, copyToClipboard]);

    return (
        <div>
            {addDocumentMutation.isError && <Alert severity="error" closable title={addDocumentMutation.error.message} />}
            {updateDocumentMutation.isError && <Alert severity="error" closable title={updateDocumentMutation.error.message} />}
            {removeDocumentMutation.isError && <Alert severity="error" closable title={removeDocumentMutation.error.message} />}
            {addDocumentMutation.isPending && (
                <Wait>
                    <div className={fr.cx("fr-grid-row")}>
                        <LoadingText as="h6" message={t("desc.adding_document")} withSpinnerIcon={true} />
                    </div>
                </Wait>
            )}
            {updateDocumentMutation.isPending && (
                <Wait>
                    <div className={fr.cx("fr-grid-row")}>
                        <LoadingText as="h6" message={t("desc.updating_document")} withSpinnerIcon={true} />
                    </div>
                </Wait>
            )}
            {removeDocumentMutation.isPending && (
                <Wait>
                    <div className={fr.cx("fr-grid-row")}>
                        <LoadingText as="h6" message={t("desc.removing_document")} withSpinnerIcon={true} />
                    </div>
                </Wait>
            )}
            {datas.length ? (
                <Table className={fr.cx("fr-table--sm", "fr-mb-0")} bordered fixed caption={t("desc.documents")} data={datas} />
            ) : (
                <div>
                    <h3>{t("desc.documents")}</h3>
                    <div>{t("desc.no_documents")}</div>
                </div>
            )}
            <Button
                className={fr.cx("fr-my-1v")}
                iconId={"fr-icon-add-circle-line"}
                priority="secondary"
                disabled={documents.length >= 4}
                onClick={() => AddDocumentDialogModal.open()}
            >
                {tCommon("add")}
            </Button>
            <AddDocumentDialog
                onAdd={(data: FormData) => {
                    addDocumentMutation.mutate(data);
                    AddDocumentDialogModal.close();
                }}
            />
            <EditDocumentDialog
                editDocument={currentDocument}
                onModify={(data: object) => {
                    updateDocumentMutation.mutate(data);
                    EditDocumentDialogModal.close();
                }}
            />
            {createPortal(
                <ConfirmRemoveDocumentDialogModal.Component
                    title={t("desc.confirm_remove_document")}
                    buttons={[
                        {
                            children: tCommon("no"),
                            priority: "secondary",
                        },
                        {
                            children: tCommon("yes"),
                            priority: "primary",
                            onClick: () => {
                                if (currentDocument) {
                                    removeDocumentMutation.mutate();
                                }
                            },
                        },
                    ]}
                >
                    <div />
                </ConfirmRemoveDocumentDialogModal.Component>,
                document.body
            )}
        </div>
    );
};

export default DocumentList;

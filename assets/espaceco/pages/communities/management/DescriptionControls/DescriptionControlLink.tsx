import Tabs from "@codegouvfr/react-dsfr/Tabs";
import { createDialogControl, useEditor } from "react-dsfr-tiptap";
import { useDialog } from "react-dsfr-tiptap/dialog";
import { useEffect, useRef, useState } from "react";

import ExternalLinkForm, { ExternalLinkFormRef } from "./ExternalLinkForm";
import DocumentsLinkForm, { DocumentsLinkFormRef } from "./DocumentsLinkForm";
import { useDocuments } from "./documentsContext";

function DescriptionLinkDialog() {
    const { isOpened, modal, onClose } = useDialog();
    const [selectedTabId, setSelectedTabId] = useState("documents");
    const documentsFormRef = useRef<DocumentsLinkFormRef>();
    const externalFormRef = useRef<ExternalLinkFormRef>();
    const editor = useEditor();
    const { documents } = useDocuments();

    useEffect(() => {
        if (isOpened) {
            const { href } = editor.getAttributes("link");
            if (href) {
                const document = documents.find((doc) => doc.download_uri === href);
                if (!document) {
                    setSelectedTabId("external");
                } else {
                    setSelectedTabId("documents");
                }
            } else {
                setSelectedTabId("documents");
            }
        }
    }, [documents, editor, isOpened]);

    const onSubmit = () => {
        if (selectedTabId === "documents") {
            documentsFormRef.current?.submit();
        } else if (selectedTabId === "external") {
            externalFormRef.current?.submit();
        }
        onClose();
    };

    return (
        <modal.Component
            title="Définir le lien"
            size="large"
            buttons={[
                {
                    doClosesModal: true,
                    children: "Annuler",
                },
                {
                    doClosesModal: false,
                    children: "Ajouter",
                    onClick: onSubmit,
                },
            ]}
        >
            <Tabs
                selectedTabId={selectedTabId}
                onTabChange={setSelectedTabId}
                tabs={[
                    { tabId: "documents", label: "Documents" },
                    { tabId: "external", label: "External image" },
                ]}
            >
                {selectedTabId === "documents" && <DocumentsLinkForm ref={documentsFormRef} documents={documents} isOpened={isOpened} />}
                {selectedTabId === "external" && <ExternalLinkForm ref={externalFormRef} isOpened={isOpened} />}
            </Tabs>
        </modal.Component>
    );
}

export const DescriptionControlLink = createDialogControl({
    buttonProps: { iconId: "ri-link", title: "Ajouter un lien" },
    DialogContent: DescriptionLinkDialog,
    onClick: (_editor, ref) => ref.current?.open(),
});

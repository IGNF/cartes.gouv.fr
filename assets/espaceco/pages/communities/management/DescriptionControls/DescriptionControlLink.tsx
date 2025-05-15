import Tabs from "@codegouvfr/react-dsfr/Tabs";
import { createDialogControl, useEditor } from "react-dsfr-tiptap";
import { useDialog } from "react-dsfr-tiptap/dialog";
import { useEffect, useRef, useState } from "react";

import ExternalLinkForm, { ExternalLinkFormRef } from "./ExternalLinkForm";
import DocumentsLinkForm, { DocumentsLinkFormRef } from "./DocumentsLinkForm";
import { useDocuments } from "./documentsContext";
import { useTranslation } from "@/i18n";

function DescriptionLinkDialog() {
    const { t } = useTranslation("ManageCommunity");
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
            title={t("tiptap.define_link")}
            size="large"
            buttons={[
                {
                    doClosesModal: true,
                    children: t("tiptap.cancel"),
                },
                {
                    doClosesModal: false,
                    children: t("tiptap.add"),
                    onClick: onSubmit,
                },
            ]}
        >
            <Tabs
                selectedTabId={selectedTabId}
                onTabChange={setSelectedTabId}
                tabs={[
                    { tabId: "documents", label: t("tiptap.documents") },
                    { tabId: "external", label: t("tiptap.external_link") },
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

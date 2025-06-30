import Tabs from "@codegouvfr/react-dsfr/Tabs";
import { createDialogControl, useEditor } from "react-dsfr-tiptap";
import { useDialog } from "react-dsfr-tiptap/dialog";
import { useEffect, useMemo, useRef, useState } from "react";

import ExternalImageForm, { ExternalImageFormRef } from "./ExternalImageForm";
import DocumentsImageForm, { DocumentsImageFormRef } from "./DocumentsImageForm";
import { useDocuments } from "./documentsContext";
import { getThumbnailFromFileName } from "@/espaceco/esco_utils";
import { useTranslation } from "@/i18n";

function DescriptionImageDialog() {
    const { t } = useTranslation("ManageCommunity");
    const { isOpened, modal, onClose } = useDialog();
    const [selectedTabId, setSelectedTabId] = useState("documents");
    const documentsFormRef = useRef<DocumentsImageFormRef>();
    const externalFormRef = useRef<ExternalImageFormRef>();
    const editor = useEditor();
    const { documents } = useDocuments();
    const images = useMemo(
        () =>
            documents
                .filter((document) => document.mime_type.startsWith("image"))
                .map((image) => ({ ...image, src: image.uri ?? getThumbnailFromFileName(image.short_fileName) })),
        [documents]
    );

    useEffect(() => {
        if (isOpened) {
            const { src } = editor.getAttributes("image");
            if (src) {
                const image = images.find((img) => img.src === src);
                if (!image) {
                    setSelectedTabId("external");
                } else {
                    setSelectedTabId("documents");
                }
            } else {
                setSelectedTabId("documents");
            }
        }
    }, [editor, isOpened, images]);

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
            title={t("tiptap.define_image")}
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
                    { tabId: "external", label: t("tiptap.external_image") },
                ]}
            >
                {selectedTabId === "documents" && <DocumentsImageForm ref={documentsFormRef} isOpened={isOpened} images={images} />}
                {selectedTabId === "external" && <ExternalImageForm ref={externalFormRef} isOpened={isOpened} />}
            </Tabs>
        </modal.Component>
    );
}

export const DescriptionControlImage = createDialogControl({
    buttonProps: { iconId: "ri-image-line", title: "Insérer une image" },
    DialogContent: DescriptionImageDialog,
    onClick: (_editor, ref) => ref.current?.open(),
});

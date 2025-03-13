import { createPortal } from "react-dom";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useTranslation } from "../../i18n/i18n";
import { v4 as uuidv4 } from "uuid";
import TextCopyToClipboard, { TextCopyToClipboardProps } from "./TextCopyToClipboard";

interface TextCopyToClipboardDialogProps extends TextCopyToClipboardProps {
    title?: string;
}

export const TextCopyToClipboardModal = createModal({
    id: `text-copy-to-clipboard-modal-${uuidv4()}`,
    isOpenedByDefault: false,
});

export function TextCopyToClipboardDialog(props: TextCopyToClipboardDialogProps) {
    const { t } = useTranslation("Common");
    const { title = t("copy_to_clipboard"), ...componentProps } = props;
    return (
        <>
            {createPortal(
                <TextCopyToClipboardModal.Component title={title}>
                    <TextCopyToClipboard {...componentProps} />
                </TextCopyToClipboardModal.Component>,
                document.body
            )}
        </>
    );
}

export default TextCopyToClipboardDialog;

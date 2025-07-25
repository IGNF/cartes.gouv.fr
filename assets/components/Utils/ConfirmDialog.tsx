import { FC, ReactNode } from "react";
import { createPortal } from "react-dom";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { getTranslation } from "../../i18n/i18n";
import { v4 as uuidv4 } from "uuid";

const { t: tCommon } = getTranslation("Common");

type ConfirmDialogProps = {
    title: string;
    children?: ReactNode;
    yesTitle?: string;
    noTitle?: string;
    onConfirm: () => void;
};

const ConfirmDialogModal = createModal({
    id: `confirm-modal-${uuidv4()}`,
    isOpenedByDefault: false,
});

const ConfirmDialog: FC<ConfirmDialogProps> = ({ title, children, onConfirm, noTitle = tCommon("no"), yesTitle = tCommon("yes") }) => {
    return (
        <>
            {createPortal(
                <ConfirmDialogModal.Component
                    title={title}
                    buttons={[
                        {
                            children: noTitle,
                            priority: "secondary",
                        },
                        {
                            children: yesTitle,
                            onClick: onConfirm,
                            priority: "primary",
                        },
                    ]}
                >
                    {children || <div />}
                </ConfirmDialogModal.Component>,
                document.body
            )}
        </>
    );
};

export { ConfirmDialogModal, ConfirmDialog };
export default ConfirmDialog;

import { FC } from "react";
import { createPortal } from "react-dom";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { getTranslation } from "../../i18n/i18n";

const { t: tCommon } = getTranslation("Common");

type ConfirmDialogProps = {
    title: string;
    yesTitle?: string;
    noTitle?: string;
    onConfirm: () => void;
};

const ConfirmDialogModal = createModal({
    id: "confirm-modal",
    isOpenedByDefault: false,
});

const ConfirmDialog: FC<ConfirmDialogProps> = ({ title, onConfirm, noTitle = tCommon("no"), yesTitle = tCommon("yes") }) => {
    return (
        <>
            {createPortal(
                <ConfirmDialogModal.Component
                    title={title}
                    size={"small"}
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
                    <div />
                </ConfirmDialogModal.Component>,
                document.body
            )}
        </>
    );
};

export { ConfirmDialogModal, ConfirmDialog };

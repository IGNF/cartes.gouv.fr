import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { FC, ReactNode, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { useTranslation } from "../../../../../../i18n/i18n";

export type PyramidRasterServiceChoiceDialogProps = {
    onRegister: (api: { open: (params: PyramidRasterServiceChoiceDialogParams) => Promise<PyramidRasterServiceChoiceDialogResponse> }) => void;
};

export type DialogOptionType = {
    id: string;
    text: ReactNode;
    hintText?: ReactNode;
    disabled?: boolean;
};

export type PyramidRasterServiceChoiceDialogParams = {
    title: string;
    desc?: ReactNode;
    options: DialogOptionType[];
};

export type PyramidRasterServiceChoiceDialogResponse = {
    response?: string;
};

export type PyramidRasterServiceChoiceDialogOpenFn = (params: PyramidRasterServiceChoiceDialogParams) => Promise<PyramidRasterServiceChoiceDialogResponse>;

/**
 * @see https://github.com/codegouvfr/react-dsfr/blob/main/test/integration/cra/src/MyDialog.tsx
 */
export const PyramidRasterServiceChoiceDialog: FC<PyramidRasterServiceChoiceDialogProps> = ({ onRegister }) => {
    const { t } = useTranslation("Common");

    const id = useId();

    const modal = useMemo(
        () =>
            createModal({
                id: `service-type-choice-modal-pyramid-raster-${id}`,
                isOpenedByDefault: false,
            }),
        [id]
    );

    const [openState, setOpenState] = useState<
        | {
              dialogParams: PyramidRasterServiceChoiceDialogParams;
              resolve: (params: PyramidRasterServiceChoiceDialogResponse) => void;
          }
        | undefined
    >(undefined);

    const isRegisteredRef = useRef(false);
    useEffect(() => {
        if (isRegisteredRef.current) return; // empêche les ré-enregistrements
        isRegisteredRef.current = true;
        onRegister({
            open: (dialogParams) =>
                new Promise<PyramidRasterServiceChoiceDialogResponse>((resolve) => {
                    setOpenState({
                        dialogParams,
                        resolve,
                    });
                    modal.open();
                }),
        });
    }, [modal, onRegister]);

    useIsModalOpen(modal, {
        onConceal: async () => {
            openState?.resolve({ response: undefined });

            setOpenState(undefined);
        },
    });

    const [selectedOption, setSelectedOption] = useState<string | undefined>();

    return createPortal(
        <modal.Component
            title={openState?.dialogParams.title}
            buttons={[
                {
                    children: t("cancel"),
                    onClick: () => {
                        openState?.resolve({ response: undefined });

                        setOpenState(undefined);
                    },
                },
                {
                    children: t("continue"),
                    onClick: () => {
                        openState?.resolve({
                            response: selectedOption,
                        });

                        setOpenState(undefined);
                    },
                    disabled: selectedOption === undefined,
                },
            ]}
            concealingBackdrop={false}
        >
            {openState?.dialogParams.desc}

            <RadioButtons
                options={
                    openState?.dialogParams.options.map((opt) => ({
                        label: opt.text,
                        hintText: opt.hintText,
                        nativeInputProps: {
                            checked: selectedOption === opt.id,
                            onChange: () => setSelectedOption(opt.id),
                            disabled: opt.disabled,
                        },
                    })) ?? []
                }
            />
        </modal.Component>,
        document.body
    );
};

import { fr } from "@codegouvfr/react-dsfr";
import Input, { type InputProps } from "@codegouvfr/react-dsfr/Input";
import { type ReactNode, useId } from "react";
import { useStyles } from "tss-react";

import { useTranslation } from "@/i18n/i18n";

type AddressInputProps = Omit<InputProps.RegularInput, "textArea" | "nativeTextAreaProps">;

export interface AddressFieldsProps {
    /** Override the fieldset legend. Defaults to the "Adresse postale" translation. */
    legend?: string;
    /** Slot pour le champ « Numéro et voie » (généralement un AsyncAutocompleteSelect). */
    numberAndStreetnameSlot: ReactNode;
    postalCodeInputProps?: Partial<AddressInputProps>;
    cityInputProps?: Partial<AddressInputProps>;
}

export default function AddressFields({ legend, numberAndStreetnameSlot, postalCodeInputProps, cityInputProps }: AddressFieldsProps) {
    const { t } = useTranslation("AddressFields");
    const legendId = useId();
    const { css, cx } = useStyles();

    function merge(defaultLabel: string, defaultAutoComplete: string, overrides: Partial<AddressInputProps> | undefined): InputProps.RegularInput {
        const { nativeInputProps: consumerNativeInputProps, ...rest } = overrides ?? {};
        return {
            label: defaultLabel,
            ...rest,
            nativeInputProps: {
                autoComplete: defaultAutoComplete,
                ...consumerNativeInputProps,
            },
        };
    }

    return (
        <fieldset className={cx(fr.cx("fr-fieldset"), css({ alignItems: "flex-start" }))} aria-labelledby={legendId}>
            <legend id={legendId} className={fr.cx("fr-fieldset__legend", "fr-fieldset__legend--regular")}>
                {legend ?? t("legend")}
            </legend>

            <div className={cx(fr.cx("fr-fieldset__element", "fr-fieldset__element--inline-grow"), "fr-fieldset__element--inline@md")}>
                {numberAndStreetnameSlot}
            </div>

            <div className={cx(fr.cx("fr-fieldset__element", "fr-fieldset__element--postal"), "fr-fieldset__element--inline@md")}>
                <Input {...merge(t("field.postalCode"), "postal-code", postalCodeInputProps)} />
            </div>

            <div className={cx(fr.cx("fr-fieldset__element"), "fr-fieldset__element--inline@md")}>
                <Input {...merge(t("field.city"), "address-level2", cityInputProps)} />
            </div>
        </fieldset>
    );
}

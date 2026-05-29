import { fr } from "@codegouvfr/react-dsfr";
import Input, { type InputProps } from "@codegouvfr/react-dsfr/Input";
import { useId } from "react";

import { useTranslation } from "@/i18n/i18n";

type AddressInputProps = Omit<InputProps.RegularInput, "textArea" | "nativeTextAreaProps">;

export interface AddressFieldsProps {
    /** Override the fieldset legend. Defaults to the "Adresse postale" translation. */
    legend?: string;
    numberInputProps?: Partial<AddressInputProps>;
    streetInputProps?: Partial<AddressInputProps>;
    postalCodeInputProps?: Partial<AddressInputProps>;
    cityInputProps?: Partial<AddressInputProps>;
}

export default function AddressFields({ legend, numberInputProps, streetInputProps, postalCodeInputProps, cityInputProps }: AddressFieldsProps) {
    const { t } = useTranslation("AddressFields");
    const legendId = useId();

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
        <fieldset className={fr.cx("fr-fieldset")} aria-labelledby={legendId}>
            <legend id={legendId} className={fr.cx("fr-fieldset__legend", "fr-fieldset__legend--regular")}>
                {legend ?? t("legend")}
            </legend>

            <div className={fr.cx("fr-fieldset__element", "fr-fieldset__element--inline", "fr-fieldset__element--number")}>
                <Input {...merge(t("field.number"), "address-line1", numberInputProps)} />
            </div>

            <div className={fr.cx("fr-fieldset__element", "fr-fieldset__element--inline", "fr-fieldset__element--inline-grow")}>
                <Input {...merge(t("field.street"), "street-address", streetInputProps)} />
            </div>

            <div className={fr.cx("fr-fieldset__element", "fr-fieldset__element--inline", "fr-fieldset__element--postal")}>
                <Input {...merge(t("field.postalCode"), "postal-code", postalCodeInputProps)} />
            </div>

            <div className={fr.cx("fr-fieldset__element", "fr-fieldset__element--inline", "fr-fieldset__element--inline-grow")}>
                <Input {...merge(t("field.city"), "address-level2", cityInputProps)} />
            </div>
        </fieldset>
    );
}

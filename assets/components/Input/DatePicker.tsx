import { fr } from "@codegouvfr/react-dsfr";
import MuiDsfrThemeProvider from "@codegouvfr/react-dsfr/mui";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { DatePicker as MuiDatePicker, DatePickerProps as MuiDatePickerProps } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider/LocalizationProvider";
import { enGB as enGBLocale, fr as frLocale } from "date-fns/locale";
import { useId } from "react";
import { symToStr } from "tsafe/symToStr";

import { useLang } from "../../i18n/i18n";

const locales = { en: enGBLocale, fr: frLocale };

interface DatePickerProps extends Omit<MuiDatePickerProps<Date, false>, "onChange"> {
    id?: string;
    label: string;
    hintText?: string;
    state?: "default" | "error" | "success";
    stateRelatedMessage?: string;
    value?: Date;
    minDate?: Date;
    onChange?: (value: Date | undefined) => void;
    className?: string;
}

const DatePicker = (props: DatePickerProps) => {
    const { id, label, hintText, state, stateRelatedMessage, value, minDate, onChange, className, ...datePickerProps } = props;

    const { lang } = useLang();

    const inputId = (function useClosure() {
        const _id = useId();
        return id ?? `${symToStr({ DatePicker })}-${_id}`;
    })();

    const messageId = `${inputId}-msg`;

    return (
        <MuiDsfrThemeProvider>
            <div className={cx(fr.cx("fr-input-group", state === "error" && "fr-input-group--error"), className)}>
                <label className={fr.cx("fr-label")} htmlFor={inputId}>
                    {label}
                    {hintText && <span className={fr.cx("fr-hint-text")}>{hintText}</span>}
                </label>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={locales[lang]}>
                    <MuiDatePicker
                        {...datePickerProps}
                        slotProps={{
                            ...datePickerProps.slotProps,
                            field: { ...datePickerProps.slotProps?.field, clearable: true, onClear: () => onChange?.(undefined) },
                        }}
                        sx={{ width: "100%" }}
                        timezone={"UTC"}
                        value={value}
                        minDate={minDate}
                        onChange={(v) => {
                            if (v) onChange?.(v);
                            else onChange?.(undefined);
                        }}
                    />
                </LocalizationProvider>
                {state !== "default" && stateRelatedMessage !== undefined && (
                    <p
                        id={messageId}
                        className={fr.cx(
                            (() => {
                                switch (state) {
                                    case "error":
                                        return "fr-error-text";
                                    case "success":
                                        return "fr-valid-text";
                                }
                            })()
                        )}
                    >
                        {stateRelatedMessage}
                    </p>
                )}
            </div>
        </MuiDsfrThemeProvider>
    );
};

export default DatePicker;

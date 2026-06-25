import { fr } from "@codegouvfr/react-dsfr";
import MuiDsfrThemeProvider from "@codegouvfr/react-dsfr/mui";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker as MuiDatePicker, DatePickerProps as MuiDatePickerProps } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { enGB as enGBLocale, fr as frLocale } from "date-fns/locale";
import { useId } from "react";
import { symToStr } from "tsafe/symToStr";

import { useLang } from "../../i18n/i18n";

const locales = { en: enGBLocale, fr: frLocale };

interface DatePickerProps extends Omit<MuiDatePickerProps<false>, "onChange"> {
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
                        sx={{
                            width: "100%",
                            ".MuiPickersInputBase-root": {
                                paddingX: fr.spacing("4v"),
                                backgroundColor: fr.colors.decisions.background.contrast.grey.default,
                            },
                            ".MuiPickersSectionList-root": {
                                paddingY: fr.spacing("2v"),
                            },
                        }}
                        timezone={"UTC"}
                        value={value ?? null}
                        minDate={minDate}
                        onChange={(v, context) => {
                            // MUI X v8 : ignorer toute valeur que MUI juge invalide (date
                            // incomplète, hors minDate/maxDate, disableFuture...). Pendant la
                            // frappe d'une année (ex. 2→0→2→5 pour "2025"), les valeurs
                            // intermédiaires hors bornes (0002, 0020, 0202) ne sont pas
                            // propagées ; seule la date finale valide (2025) est remontée.
                            if (context.validationError !== null && context.validationError !== undefined) return;
                            onChange?.(v ?? undefined);
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

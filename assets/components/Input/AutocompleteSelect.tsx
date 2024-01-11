import { fr } from "@codegouvfr/react-dsfr";
import MuiDsfrThemeProvider from "@codegouvfr/react-dsfr/mui";
import { Autocomplete, AutocompleteFreeSoloValueMapping, AutocompleteValue, CreateFilterOptionsConfig, TextField, createFilterOptions } from "@mui/material";
import { CSSProperties, useId } from "react";
import { ControllerRenderProps } from "react-hook-form";
import { symToStr } from "tsafe/symToStr";

interface AutocompleteSelectProps<T> {
    id?: string;
    label: string;
    hintText: string;
    state?: "default" | "error" | "success";
    stateRelatedMessage?: string;
    defaultValue?: T[];
    searchFilter?: CreateFilterOptionsConfig<T>;
    options: T[];
    multiple?: boolean;
    autoComplete?: boolean;
    getOptionLabel?: (option: T | AutocompleteFreeSoloValueMapping<boolean>) => string;
    isOptionEqualToValue?: (option: T, value: T) => boolean;
    freeSolo?: boolean;
    disabled?: boolean;
    onChange?: (event: React.SyntheticEvent, value: AutocompleteValue<T, boolean, boolean, boolean>) => void;

    /** utiliser `controllerField` et `onChange` si contrôlé par le Controller de react-hook-form, ne pas utiliser en même temps que `value` */
    controllerField?: ControllerRenderProps;
    /** utiliser `value` et `onChange` si contrôlé par useState, ne pas utiliser en même temps que `controllerField` */
    value?: T[];
}

const AutocompleteSelect = <T,>(props: AutocompleteSelectProps<T>) => {
    const {
        id,
        label,
        hintText,
        state,
        stateRelatedMessage,
        defaultValue = [],
        searchFilter = {
            ignoreAccents: true,
            ignoreCase: true,
            limit: 10,
        },
        freeSolo = false,
        options,
        multiple = true,
        autoComplete = true,
        getOptionLabel,
        isOptionEqualToValue,
        disabled = false,
        controllerField,
        onChange,
        value,
    } = props;

    const inputId = (function useClosure() {
        const _id = useId();

        return id ?? `${symToStr({ AutocompleteSelect })}-${_id}`;
    })();

    const messageId = `${inputId}-msg`;

    const customStyle: CSSProperties = {
        backgroundColor: fr.colors.decisions.background.contrast.grey.default,
        borderRadius: `${fr.spacing("1v")} ${fr.spacing("1v")} 0 0`,
        boxShadow: `inset 0 -2px 0 0 var(${fr.colors.decisions.border.plain.grey.default})`,
        marginTop: fr.spacing("1v"),
        fontFamily: "Marianne, arial, sans-serif",
    };

    return (
        <MuiDsfrThemeProvider>
            <div className={fr.cx("fr-input-group", state === "error" && "fr-input-group--error")}>
                <label className={fr.cx("fr-label")} htmlFor={inputId}>
                    {label}
                    {hintText && <span className="fr-hint-text">{hintText}</span>}
                </label>

                <Autocomplete
                    {...controllerField}
                    id={inputId}
                    aria-describedby={messageId}
                    autoComplete={autoComplete}
                    freeSolo={freeSolo}
                    disablePortal={true}
                    multiple={multiple}
                    filterSelectedOptions
                    forcePopupIcon={true}
                    defaultValue={defaultValue}
                    onChange={onChange}
                    filterOptions={createFilterOptions(searchFilter)}
                    options={options}
                    renderInput={(params) => <TextField {...params} />}
                    getOptionLabel={getOptionLabel}
                    isOptionEqualToValue={isOptionEqualToValue}
                    disabled={disabled}
                    style={customStyle}
                    value={value}
                />

                {state !== "default" && (
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

export default AutocompleteSelect;

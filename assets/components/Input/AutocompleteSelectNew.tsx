import { fr } from "@codegouvfr/react-dsfr";
import MuiDsfrThemeProvider from "@codegouvfr/react-dsfr/mui";
import { Autocomplete, AutocompleteProps, CreateFilterOptionsConfig, TextField, createFilterOptions } from "@mui/material";
import { CSSProperties, ReactNode, useId } from "react";
import { symToStr } from "tsafe/symToStr";

import "../../../assets/sass/components/autocomplete.scss";

interface AutocompleteSelectNewProps<T> extends Partial<AutocompleteProps<T, boolean, boolean, boolean>> {
    id?: string;
    label: string;
    hintText?: ReactNode;
    state?: "default" | "error" | "success";
    stateRelatedMessage?: string;
    searchFilter?: CreateFilterOptionsConfig<T>;
}

const defaultProps = {
    defaultValue: [],
    searchFilter: {
        ignoreAccents: true,
        ignoreCase: true,
        limit: 10,
    },
    freeSolo: false,
    multiple: true,
    autoComplete: true,
    options: [],
};

const AutocompleteSelectNew = <T,>(props: AutocompleteSelectNewProps<T>) => {
    const { id, label, hintText, state = "default", stateRelatedMessage, searchFilter, ...restProps } = { ...defaultProps, ...props };

    const inputId = (function useClosure() {
        const _id = useId();
        return id ?? `${symToStr({ AutocompleteSelectNew })}-${_id}`;
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
                    {...restProps}
                    id={inputId}
                    aria-describedby={messageId}
                    filterOptions={createFilterOptions({ ...defaultProps.searchFilter, ...searchFilter })}
                    options={Array.isArray(restProps.options) ? restProps.options : []}
                    renderInput={(params) => <TextField {...params} variant={"filled"} size={"small"} />}
                    style={customStyle}
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

export default AutocompleteSelectNew;

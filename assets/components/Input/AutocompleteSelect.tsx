import { fr } from "@codegouvfr/react-dsfr";
import { FC, useState } from "react";
import { Autocomplete } from "@mui/material";
import { createFilterOptions, TextField } from "@mui/material";
import MuiDsfrThemeProvider from "@codegouvfr/react-dsfr/mui";

export type filterType = {
    ignoreAccents?: boolean;
    ignoreCase?: boolean;
    limit?: number;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
type AutocompleteSelectProps = {
    label: string;
    hintText: string;
    state?: "default" | "error" | "success";
    stateRelatedMessage?: string;
    defaultValue?: any[];
    searchFilter?: filterType;
    options: any[];
    getOptionLabel?: (option: any) => string;
    isOptionEqualToValue?: (option: any, value: any) => boolean;
    freeSolo: boolean;
    /** readonly parce que `values` de `onChange` de AutoComplete est readonly */
    onChange: (event: React.SyntheticEvent, value: readonly string[]) => void;
};

const AutocompleteSelect: FC<AutocompleteSelectProps> = (props) => {
    const {
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
        options,
        freeSolo,
        onChange,
    } = props;

    const [value, setValue] = useState<readonly string[]>(defaultValue);

    return (
        <MuiDsfrThemeProvider>
            <div className={fr.cx("fr-input-group", state === "error" && "fr-input-group--error")}>
                <label className={fr.cx("fr-label")}>
                    {label}
                    <span className={fr.cx("fr-hint-text")}>{hintText}</span>
                </label>
                <Autocomplete
                    autoComplete={true}
                    value={value}
                    freeSolo={freeSolo !== undefined}
                    disablePortal
                    multiple
                    filterSelectedOptions
                    filterOptions={createFilterOptions(searchFilter)}
                    options={options}
                    renderInput={(params) => <TextField {...params} />}
                    onChange={(e, values) => {
                        setValue(values);
                        onChange(e, values);
                    }}
                />
                {state === "error" && <p className={fr.cx("fr-error-text")}>{stateRelatedMessage}</p>}
            </div>
        </MuiDsfrThemeProvider>
    );
};

export default AutocompleteSelect;

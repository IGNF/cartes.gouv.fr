import { fr } from "@codegouvfr/react-dsfr";
import { FC, useState } from "react";
import { Autocomplete } from "@mui/material";
import { TextField } from "@mui/material";
import MuiDsfrThemeProvider from "@codegouvfr/react-dsfr/mui";

type KeywordsSelectProps = {
    label: string;
    hintText: string;
    state?: "default" | "error" | "success";
    stateRelatedMessage?: string;
    defaultValue?: string[];
    keywords: string[];
    freeSolo: boolean;
    /** readonly parce que `values` de `onChange` de AutoComplete est readonly */
    onChange: (values: readonly string[]) => void;
};

const KeywordsSelect: FC<KeywordsSelectProps> = (props) => {
    const { label, hintText, state, stateRelatedMessage, defaultValue = [], keywords, freeSolo, onChange } = props;
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
                    options={keywords}
                    renderInput={(params) => <TextField {...params} />}
                    onChange={(e, values) => {
                        setValue(values);
                        onChange(values);
                    }}
                />
                {state === "error" && <p className={fr.cx("fr-error-text")}>{stateRelatedMessage}</p>}
            </div>
        </MuiDsfrThemeProvider>
    );
};

export default KeywordsSelect;

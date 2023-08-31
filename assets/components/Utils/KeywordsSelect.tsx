import { fr } from "@codegouvfr/react-dsfr";
import { FC, useState } from "react";
import { Autocomplete } from "@mui/material";
import { TextField } from "@mui/material";
import MuiDsfrThemeProvider from "@codegouvfr/react-dsfr/mui";

type KeywordsComponentProps = {
    label: string;
    hintText: string;
    defaultValue?: string[];
    keywords: string[];
    freeSolo: boolean;
    onChange: (values: string[]) => void;
};

const KeywordsSelect: FC<KeywordsComponentProps> = (props) => {
    const { label, hintText, defaultValue = [], keywords, freeSolo, onChange } = props;
    const [value, setValue] = useState<string[]>(defaultValue);

    return (
        <MuiDsfrThemeProvider>
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
                onChange={(e, values: string[]) => {
                    setValue(values);
                    onChange(values);
                }}
            />
        </MuiDsfrThemeProvider>
    );
};

export default KeywordsSelect;

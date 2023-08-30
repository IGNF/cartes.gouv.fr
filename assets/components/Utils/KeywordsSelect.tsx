import { fr } from "@codegouvfr/react-dsfr";
import { FC } from "react";
import { Autocomplete } from "@mui/material";
import { TextField } from "@mui/material";
import MuiDsfrThemeProvider from "@codegouvfr/react-dsfr/mui";

type KeywordsComponentProps = {
    label: string;
    hintText: string;
    keywords: string[];
    freeSolo: boolean;
    onChange: (values: string[]) => void;
};

const KeywordsSelect: FC<KeywordsComponentProps> = (props) => {
    const { label, hintText, keywords, freeSolo, onChange } = props;

    return (
        <MuiDsfrThemeProvider>
            <label className={fr.cx("fr-label")}>
                {label}
                <span className={fr.cx("fr-hint-text")}>{hintText}</span>
            </label>
            <Autocomplete
                autoComplete={true}
                freeSolo={freeSolo !== undefined}
                disablePortal
                multiple
                filterSelectedOptions
                options={keywords}
                renderInput={(params) => <TextField {...params} />}
                onChange={(e, values: string[]) => onChange(values)}
            />
        </MuiDsfrThemeProvider>
    );
};

export default KeywordsSelect;

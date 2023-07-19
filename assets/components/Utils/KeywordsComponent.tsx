import { FC } from "react";
import { Autocomplete } from "@mui/material";
import { TextField } from "@mui/material";
import MuiDsfrThemeProvider from "@codegouvfr/react-dsfr/mui";

type KeywordsComponentProps = {
    label: string;
    hintLabel: string;
    keywords: string[];
    onChange: (values: string[]) => string;
};

const KeywordsComponent: FC<KeywordsComponentProps> = (props) => {
    const { label, hintLabel, keywords, onChange } = props;

    return (
        <MuiDsfrThemeProvider>
            <label className="fr-label">
                {label}
                <span className="fr-hint-text">{hintLabel}</span>
            </label>
            <Autocomplete
                autoComplete={true}
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

export default KeywordsComponent;

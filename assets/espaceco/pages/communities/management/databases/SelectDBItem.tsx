import { IDBItemOption } from "@/@types/app_espaceco";
import { fr } from "@codegouvfr/react-dsfr";
import MuiDsfrThemeProvider from "@codegouvfr/react-dsfr/mui";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { FC, ReactNode, useState } from "react";
import "../../../../../sass/components/autocomplete.scss";

export type SelectDBItemProps = {
    label?: ReactNode;
    hintText?: ReactNode;
    placeholder?: string;
    items: IDBItemOption[];
    onChange: (item: IDBItemOption | null) => void;
};

const SelectDBItem: FC<SelectDBItemProps> = ({ label, hintText, placeholder, items, onChange }) => {
    const [value, setValue] = useState<IDBItemOption | null>(null);

    return (
        <div className={fr.cx("fr-input-group", "fr-col-12")}>
            {label && (
                <label className={fr.cx("fr-label")}>
                    {label}
                    {hintText && <span className="fr-hint-text">{hintText}</span>}
                </label>
            )}
            <MuiDsfrThemeProvider>
                <Autocomplete<IDBItemOption>
                    disablePortal={true}
                    size={"small"}
                    blurOnSelect={true}
                    clearOnBlur={true}
                    getOptionLabel={(option) => (option as IDBItemOption).title}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    options={items.map((t) => ({
                        title: t.title,
                        id: t.id,
                    }))}
                    renderInput={(params) => <TextField {...params} variant={"filled"} size={"small"} label={placeholder} />}
                    value={value}
                    onChange={(_, v) => {
                        onChange(v);
                        setValue(null);
                    }}
                />
            </MuiDsfrThemeProvider>
        </div>
    );
};

export default SelectDBItem;

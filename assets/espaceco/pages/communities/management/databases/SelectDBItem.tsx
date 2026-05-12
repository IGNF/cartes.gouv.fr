import { IDBItemOption } from "@/@types/app_espaceco";
import { fr } from "@codegouvfr/react-dsfr";
import TextField from "@mui/material/TextField";
import { FC, ReactNode, useState } from "react";
import AutocompleteSelect from "../../../../../components/Input/AutocompleteSelect";

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
        <div className={fr.cx("fr-col-12")}>
            <AutocompleteSelect
                label={label ?? ""}
                hintText={hintText}
                blurOnSelect={true}
                clearOnBlur={true}
                getOptionLabel={(option) => option.title}
                isOptionEqualToValue={(option, selectedValue) => option.id === selectedValue.id}
                options={items.map((item) => ({
                    title: item.title,
                    id: item.id,
                }))}
                renderInput={(params) => <TextField {...params} variant={"filled"} size={"small"} label={placeholder} />}
                value={value}
                onChange={(_, selectedValue) => {
                    onChange(selectedValue);
                    setValue(null);
                }}
                multiple={false}
                freeSolo={false}
            />
        </div>
    );
};

export default SelectDBItem;

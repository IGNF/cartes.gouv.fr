import { Controller, useFormContext } from "react-hook-form";

import AutocompleteSelect from "@/components/Input/AutocompleteSelect";
import { getThematicCategories } from "@/utils/metadata";
import { type DatasetAddFormValues } from "../datasetAddSchema";

const thematicCategories = getThematicCategories();
const thematicCategoryLabels = new Map(thematicCategories.map((category) => [category.code, category.text]));

export default function ThemesSection() {
    const { control } = useFormContext<DatasetAddFormValues>();

    return (
        <div>
            <Controller
                control={control}
                name="themes"
                render={({ field, fieldState: { error } }) => (
                    <AutocompleteSelect
                        label="Thématiques"
                        hintText="Vous pouvez sélectionner plusieurs thématiques"
                        options={thematicCategories.map((category) => category.code)}
                        getOptionLabel={(option) => thematicCategoryLabels.get(option) ?? String(option)}
                        searchFilter={{ limit: 40 }}
                        state={error ? "error" : "default"}
                        stateRelatedMessage={error?.message}
                        value={field.value ?? []}
                        onChange={(_, value) => field.onChange(value)}
                        onBlur={field.onBlur}
                        multiple
                    />
                )}
            />
        </div>
    );
}

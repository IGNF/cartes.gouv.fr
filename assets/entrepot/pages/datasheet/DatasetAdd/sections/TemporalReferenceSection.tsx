import { Controller, useFormContext } from "react-hook-form";

import DatePicker from "@/components/Input/DatePicker";
import { type DatasetAddFormValues } from "../datasetAddSchema";

export default function TemporalReferenceSection() {
    const { control } = useFormContext<DatasetAddFormValues>();

    return (
        <div>
            <Controller
                control={control}
                name="production_date"
                render={({ field: { value, onChange }, fieldState: { error } }) => (
                    <DatePicker
                        label="Date de production de la donnée"
                        hintText="Format attendu : JJ/MM/AAAA"
                        value={value instanceof Date ? value : undefined}
                        maxDate={new Date()}
                        onChange={onChange}
                        state={error ? "error" : "default"}
                        stateRelatedMessage={error?.message}
                    />
                )}
            />
        </div>
    );
}

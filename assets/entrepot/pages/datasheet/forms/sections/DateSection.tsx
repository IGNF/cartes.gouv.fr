import Select from "@codegouvfr/react-dsfr/Select";
import { Controller, useFormContext } from "react-hook-form";

import { useTranslation } from "@/i18n/i18n";
import DatePicker from "@/components/Input/DatePicker";

import frequencyCodes from "@/data/maintenance_frequency.json";
import { MetadataFormValues } from "../metadataSchema";

export default function DateSection() {
    const { t } = useTranslation("DatasheetSections");
    const {
        register,
        control,
        formState: { errors },
    } = useFormContext<Partial<MetadataFormValues>>();

    return (
        <div>
            <Controller
                control={control}
                name="creationDate"
                render={({ field: { value, onChange } }) => (
                    <DatePicker
                        label={t("field.creationDate")}
                        hintText={t("field.creationDate.hint")}
                        value={value instanceof Date ? value : undefined}
                        onChange={onChange}
                        state={errors.creationDate ? "error" : "default"}
                        stateRelatedMessage={errors.creationDate?.message}
                    />
                )}
            />

            <Select
                label={t("field.updateFrequency")}
                state={errors.updateFrequency ? "error" : "default"}
                stateRelatedMessage={errors.updateFrequency?.message}
                nativeSelectProps={{ ...register("updateFrequency") }}
            >
                <option value="" disabled>
                    —
                </option>
                {Object.entries(frequencyCodes).map(([key, label]) => (
                    <option key={key} value={key}>
                        {label}
                    </option>
                ))}
            </Select>
        </div>
    );
}

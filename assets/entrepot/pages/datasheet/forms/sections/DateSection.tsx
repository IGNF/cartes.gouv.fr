import Select from "@codegouvfr/react-dsfr/SelectNext";
import { Controller, useFormContext } from "react-hook-form";

import DatePicker from "@/components/Input/DatePicker";
import { useTranslation } from "@/i18n/i18n";
import { MetadataFormValues, UPDATE_FREQUENCIES } from "../metadataSchema";

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
                name="date_creation"
                render={({ field: { value, onChange } }) => (
                    <DatePicker
                        label={t("field.creationDate")}
                        hintText={t("field.creationDate.hint")}
                        value={value instanceof Date ? value : undefined}
                        onChange={onChange}
                        state={errors.date_creation ? "error" : "default"}
                        stateRelatedMessage={errors.date_creation?.message}
                    />
                )}
            />

            <Select
                label={t("field.updateFrequency")}
                placeholder={t("field.updateFrequency.placeholder")}
                options={UPDATE_FREQUENCIES.map((code) => ({
                    value: code,
                    label: t("field.updateFrequency.option", { code }),
                }))}
                state={errors.update_frequency ? "error" : "default"}
                stateRelatedMessage={errors.update_frequency?.message}
                nativeSelectProps={{ ...register("update_frequency") }}
            />
        </div>
    );
}

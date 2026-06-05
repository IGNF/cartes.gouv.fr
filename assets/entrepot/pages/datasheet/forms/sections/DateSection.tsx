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
                placeholder={t("field.updateFrequency.placeholder")}
                options={UPDATE_FREQUENCIES.map((code) => ({
                    value: code,
                    label: t("field.updateFrequency.option", { code }),
                }))}
                state={errors.updateFrequency ? "error" : "default"}
                stateRelatedMessage={errors.updateFrequency?.message}
                nativeSelectProps={{ ...register("updateFrequency") }}
            />
        </div>
    );
}

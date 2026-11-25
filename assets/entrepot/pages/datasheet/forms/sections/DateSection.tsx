import Select from "@codegouvfr/react-dsfr/SelectNext";
import { Controller, useFormContext } from "react-hook-form";

import DatePicker from "@/components/Input/DatePicker";
import { useTranslation } from "@/i18n/i18n";
import { MetadataFormValues, UPDATE_FREQUENCIES } from "../metadataSchema";

const DATE_FIELDS = [
    { name: "date_creation", label: "field.creationDate" },
    { name: "date_publication", label: "field.publicationDate" },
    { name: "date_revision", label: "field.revisionDate" },
] as const;

export default function DateSection() {
    const { t } = useTranslation("DatasheetSections");
    const {
        register,
        control,
        formState: { errors },
    } = useFormContext<Partial<MetadataFormValues>>();

    return (
        <div>
            {DATE_FIELDS.map(({ name, label }) => (
                <Controller
                    key={name}
                    control={control}
                    name={name}
                    render={({ field: { value, onChange } }) => (
                        <DatePicker
                            label={t(label)}
                            hintText={t("field.date.hint")}
                            disableFuture
                            value={value instanceof Date ? value : undefined}
                            onChange={onChange}
                            state={errors[name] ? "error" : "default"}
                            stateRelatedMessage={errors[name]?.message}
                        />
                    )}
                />
            ))}

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

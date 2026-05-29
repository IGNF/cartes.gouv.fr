import { Controller, useFormContext } from "react-hook-form";

import AutocompleteSelect from "@/components/Input/AutocompleteSelect";
import { useTranslation } from "@/i18n/i18n";
import { MetadataFormValues } from "../metadataSchema";

export default function SpatialCoverageSection() {
    const { t } = useTranslation("DatasheetSections");
    const {
        control,
        formState: { errors },
    } = useFormContext<Partial<MetadataFormValues>>();

    return (
        <div>
            <Controller
                control={control}
                name="territories"
                render={({ field, fieldState: { error } }) => (
                    <AutocompleteSelect
                        label={t("field.territories")}
                        hintText={t("field.territories.hint")}
                        options={[]}
                        freeSolo
                        state={error ? "error" : "default"}
                        stateRelatedMessage={error?.message ?? (errors.territories as { message?: string } | undefined)?.message}
                        value={field.value ?? []}
                        onChange={(_, value) => field.onChange(value)}
                        onBlur={field.onBlur}
                    />
                )}
            />
        </div>
    );
}

import { fr } from "@codegouvfr/react-dsfr";
import territories from "geopf-extensions-openlayers/src/packages/Controls/Territories/Territories.json";
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
                        options={territories}
                        getOptionLabel={(option) => option.title}
                        getOptionKey={(option) => option.id}
                        multiple={true}
                        state={error ? "error" : "default"}
                        stateRelatedMessage={error?.message ?? errors.territories?.message}
                        value={field.value ?? []}
                        onChange={(_, value) => field.onChange(value)}
                        onBlur={field.onBlur}
                        popupIcon={<span className={fr.cx("fr-icon-search-line", "fr-icon--sm")} />}
                    />
                )}
            />
        </div>
    );
}

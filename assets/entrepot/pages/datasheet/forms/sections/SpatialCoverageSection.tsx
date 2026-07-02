import { fr } from "@codegouvfr/react-dsfr";
import { Controller, useFormContext } from "react-hook-form";

import AsyncAutocompleteSelect from "@/components/Input/AsyncAutocompleteSelect";
import api from "@/entrepot/api";
import { useTranslation } from "@/i18n/i18n";
import RQKeys from "@/modules/entrepot/RQKeys";
import { type Territory, MetadataFormValues } from "../metadataSchema";

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
                    <AsyncAutocompleteSelect<Territory, true>
                        label={t("field.territories")}
                        hintText={t("field.territories.hint")}
                        queryKey={(s) => RQKeys.search_territories(s)}
                        queryFn={(s, signal) => api.geocoding.searchAdminUnits(s, signal)}
                        getOptionLabel={(option) => option.title}
                        getOptionKey={(option) => option.id}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        multiple={true}
                        state={error ? "error" : "default"}
                        stateRelatedMessage={error?.message ?? errors.territories?.message}
                        value={field.value ?? []}
                        onChange={(_, value) => field.onChange(value)}
                        onBlur={field.onBlur}
                        ref={field.ref}
                        popupIcon={<span className={fr.cx("fr-icon-search-line", "fr-icon--sm")} />}
                    />
                )}
            />
        </div>
    );
}

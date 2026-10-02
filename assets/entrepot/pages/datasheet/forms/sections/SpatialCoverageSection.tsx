import { fr } from "@codegouvfr/react-dsfr";
import { Controller, useFormContext } from "react-hook-form";

import AsyncAutocompleteSelect from "@/components/Input/AsyncAutocompleteSelect";
import api from "@/entrepot/api";
import type { AdminUnitTerritory } from "@/entrepot/api/geocoding";
import { useTranslation } from "@/i18n/i18n";
import RQKeys from "@/modules/entrepot/RQKeys";
import type { MetadataFormValues } from "../metadataSchema";

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
                    <AsyncAutocompleteSelect<AdminUnitTerritory, true>
                        label={t("field.territories")}
                        hintText={t("field.territories.hint")}
                        queryKey={(s) => RQKeys.search_territories(s)}
                        queryFn={(s, signal) => api.geocoding.searchAdminUnits(s, signal)}
                        getOptionLabel={(option) => option.title}
                        renderOption={(props, option) => (
                            <li {...props} key={option.id}>
                                {option.title}
                                {/* Code INSEE affiché dans la liste uniquement (pas dans le tag) pour distinguer les homonymes */}
                                {option.insee && <span className={fr.cx("fr-ml-1v", "fr-mb-0")}>({option.insee})</span>}
                            </li>
                        )}
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

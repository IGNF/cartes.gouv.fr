import { fr } from "@codegouvfr/react-dsfr";
import Input from "@codegouvfr/react-dsfr/Input";
import Select from "@codegouvfr/react-dsfr/SelectNext";
import { Controller, useFormContext } from "react-hook-form";

import AsyncAutocompleteSelect from "@/components/Input/AsyncAutocompleteSelect";
import api from "@/entrepot/api";
import type { AdminUnitTerritory } from "@/entrepot/api/geocoding";
import { useTranslation } from "@/i18n/i18n";
import RQKeys from "@/modules/entrepot/RQKeys";
import { SCALES, type MetadataFormValues } from "../metadataSchema";

export default function SpatialCoverageSection() {
    const { t } = useTranslation("DatasheetSections");
    const {
        control,
        register,
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

            {/* ordre et aide de #1037 (04/11/2026), la maquette les inverse */}
            <Select
                label={t("field.scale")}
                hint={t("field.scale.info")}
                placeholder={t("field.scale.placeholder")}
                options={SCALES.map((scale) => ({ value: String(scale), label: t("field.scale.option", { scale }) }))}
                state={errors.scale ? "error" : "default"}
                stateRelatedMessage={errors.scale?.message}
                nativeSelectProps={{ ...register("scale", { setValueAs: (value: string) => (value === "" ? undefined : Number(value)) }) }}
            />

            <Input
                label={t("field.resolution")}
                hintText={t("field.resolution.hint")}
                state={errors.resolution ? "error" : "default"}
                stateRelatedMessage={errors.resolution?.message}
                nativeInputProps={{
                    type: "number",
                    step: "any",
                    min: 0,
                    ...register("resolution", { setValueAs: (value: string) => (value === "" ? undefined : Number(value)) }),
                }}
            />
        </div>
    );
}

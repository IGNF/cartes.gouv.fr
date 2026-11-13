import { fr } from "@codegouvfr/react-dsfr";
import { Select } from "@codegouvfr/react-dsfr/SelectNext";
import { Controller, useFormContext, useWatch } from "react-hook-form";

import AsyncAutocompleteSelect from "@/components/Input/AsyncAutocompleteSelect";
import api from "@/entrepot/api";
import type { AdminUnitTerritory } from "@/entrepot/api/geocoding";
import { useTranslation } from "@/i18n";
import RQKeys from "@/modules/entrepot/RQKeys";
import { type DatasetAddFormValues } from "../datasetAddSchema";

// valeur du tag zone : « D001 Ain », « R11 Île-de-France », nom seul pour un EPCI
const zoneLabel = (territory: AdminUnitTerritory) => (territory.zoneCode ? `${territory.zoneCode} ${territory.title}` : territory.title);

type SpatialReferenceSectionProps = {
    projections: Record<string, string>;
};

export default function SpatialReferenceSection({ projections }: SpatialReferenceSectionProps) {
    const { t } = useTranslation("DatasetAdd");
    const {
        register,
        control,
        formState: { errors },
    } = useFormContext<DatasetAddFormValues>();
    const srid = useWatch({ control, name: "srid" });

    // une projection détectée hors liste reste affichée telle quelle plutôt qu’un choix vide
    const options = Object.entries(projections).map(([code, name]) => ({ label: name, value: code }));
    if (srid && !(srid in projections)) {
        options.unshift({ label: srid, value: srid });
    }

    return (
        <div>
            <Select
                label={t("srid.label")}
                placeholder={t("srid.placeholder")}
                state={errors.srid ? "error" : "default"}
                stateRelatedMessage={errors.srid?.message}
                nativeSelectProps={{ ...register("srid"), value: srid }}
                options={options}
            />

            <Controller
                control={control}
                name="zone"
                render={({ field, fieldState: { error } }) => (
                    <AsyncAutocompleteSelect<AdminUnitTerritory, false, false, true>
                        label={t("zone.label")}
                        hintText={t("zone.hint")}
                        queryKey={(s) => RQKeys.search_territories(s)}
                        queryFn={(s, signal) => api.geocoding.searchAdminUnits(s, signal)}
                        getOptionLabel={(option) => (typeof option === "string" ? option : zoneLabel(option))}
                        renderOption={(props, option) => (
                            <li {...props} key={option.id}>
                                {zoneLabel(option)}
                            </li>
                        )}
                        isOptionEqualToValue={(option, value) => zoneLabel(option) === (typeof value === "string" ? value : zoneLabel(value))}
                        freeSolo
                        autoSelect
                        multiple={false}
                        state={error ? "error" : "default"}
                        stateRelatedMessage={error?.message}
                        value={field.value}
                        onChange={(_, value) => field.onChange(typeof value === "string" ? value : value ? zoneLabel(value) : "")}
                        onBlur={field.onBlur}
                        ref={field.ref}
                        popupIcon={<span className={fr.cx("fr-icon-search-line", "fr-icon--sm")} />}
                    />
                )}
            />
        </div>
    );
}

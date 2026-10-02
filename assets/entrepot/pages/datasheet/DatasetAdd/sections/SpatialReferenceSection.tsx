import { fr } from "@codegouvfr/react-dsfr";
import { Select as SelectNext } from "@codegouvfr/react-dsfr/SelectNext";
import { Controller, useFormContext } from "react-hook-form";

import AsyncAutocompleteSelect from "@/components/Input/AsyncAutocompleteSelect";
import api from "@/entrepot/api";
import type { AdminUnitTerritory } from "@/entrepot/api/geocoding";
import RQKeys from "@/modules/entrepot/RQKeys";
import { type DatasetAddFormValues } from "../datasetAddSchema";

/** libellé de zone préfixé du code INSEE quand il est connu (ex : « 01 Ain ») */
const zoneLabel = (territory: AdminUnitTerritory) => (territory.insee ? `${territory.insee} ${territory.title}` : territory.title);

type SpatialReferenceSectionProps = {
    /** projections EPSG proposées dans la liste déroulante */
    projections: Record<string, string>;
};

export default function SpatialReferenceSection({ projections }: SpatialReferenceSectionProps) {
    const {
        register,
        watch,
        control,
        formState: { errors },
    } = useFormContext<DatasetAddFormValues>();

    const selectedSrid = watch("srid");

    // la projection détectée au téléversement peut manquer dans la liste (résolution EPSG asynchrone échouée) : on l’affiche telle quelle plutôt qu’un select vide
    const options = Object.entries(projections).map(([code, name]) => ({ label: name, value: code }));
    if (selectedSrid && !(selectedSrid in projections)) {
        options.unshift({ label: selectedSrid, value: selectedSrid });
    }

    return (
        <div>
            <SelectNext
                label="Projection"
                state={errors.srid ? "error" : "default"}
                stateRelatedMessage={errors.srid?.message}
                placeholder="Sélectionnez une projection"
                nativeSelectProps={{
                    ...register("srid"),
                    value: selectedSrid,
                }}
                options={options}
            />

            <Controller
                control={control}
                name="zone"
                render={({ field, fieldState: { error } }) => (
                    <AsyncAutocompleteSelect<AdminUnitTerritory, false, false, true>
                        label="Étendue spatiale"
                        hintText="Saisissez au moins 3 caractères, ou une valeur libre si aucun territoire proposé ne convient"
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
                        value={field.value ?? ""}
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

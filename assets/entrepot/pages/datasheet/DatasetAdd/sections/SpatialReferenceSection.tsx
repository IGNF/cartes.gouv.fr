import { Select as SelectNext } from "@codegouvfr/react-dsfr/SelectNext";
import { useFormContext } from "react-hook-form";

import { type DatasetAddFormValues } from "../datasetAddSchema";

type SpatialReferenceSectionProps = {
    /** projections EPSG proposées dans la liste déroulante */
    projections: Record<string, string>;
};

export default function SpatialReferenceSection({ projections }: SpatialReferenceSectionProps) {
    const {
        register,
        watch,
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
        </div>
    );
}

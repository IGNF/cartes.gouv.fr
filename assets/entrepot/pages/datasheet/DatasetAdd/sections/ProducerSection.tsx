import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Input from "@codegouvfr/react-dsfr/Input";
import { Controller, useFormContext, useWatch } from "react-hook-form";

import AutocompleteSelect from "@/components/Input/AutocompleteSelect";
import { PRODUCER_SHORT_MAX_LENGTH, type DatasetAddFormValues } from "../datasetAddSchema";

type ProducerSectionProps = {
    /** noms des organismes proposés en autocomplétion */
    organizationsOptions: string[];
    /** valeur par défaut proposée : le nom du responsable de la donnée */
    defaultProducer?: string;
};

export default function ProducerSection({ organizationsOptions, defaultProducer }: ProducerSectionProps) {
    const {
        register,
        control,
        formState: { errors },
    } = useFormContext<DatasetAddFormValues>();

    const producer = useWatch({ control, name: "producer" });
    const producerChanged = Boolean(defaultProducer) && producer !== "" && producer !== defaultProducer;

    return (
        <div>
            <Controller
                control={control}
                name="producer"
                render={({ field, fieldState: { error } }) => (
                    <AutocompleteSelect
                        {...field}
                        label="Nom de l’organisme"
                        hintText="Utilisez l’auto-complétion ou saisissez directement un nom"
                        options={organizationsOptions}
                        state={error ? "error" : "default"}
                        stateRelatedMessage={error?.message}
                        multiple={false}
                        freeSolo={true}
                        autoSelect={true}
                        getOptionLabel={(option) => option.toString()}
                        searchFilter={{ limit: undefined }}
                        value={field.value ?? ""}
                        onChange={(_, value) => field.onChange(value ?? "")}
                    />
                )}
            />

            {producerChanged && (
                <Alert
                    className={fr.cx("fr-mb-3w")}
                    severity="warning"
                    small
                    description="Attention : vous avez renseigné un organisme différent du responsable de la donnée, pensez à vérifier que la partie « Producteurs » de la description de la fiche est correctement complétée."
                />
            )}

            <Input
                label="Acronyme de l’organisme (optionnel)"
                hintText={`${PRODUCER_SHORT_MAX_LENGTH} caractères maximum, en majuscules`}
                state={errors.producer_short ? "error" : "default"}
                stateRelatedMessage={errors.producer_short?.message}
                nativeInputProps={{
                    ...register("producer_short"),
                    maxLength: PRODUCER_SHORT_MAX_LENGTH,
                    style: { textTransform: "uppercase" },
                }}
            />
        </div>
    );
}

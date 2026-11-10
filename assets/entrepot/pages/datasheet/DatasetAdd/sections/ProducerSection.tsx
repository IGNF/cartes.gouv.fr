import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Input from "@codegouvfr/react-dsfr/Input";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { tss } from "tss-react";

import AutocompleteSelect from "@/components/Input/AutocompleteSelect";
import { useTranslation } from "@/i18n";
import { PRODUCER_SHORT_MAX_LENGTH, type DatasetAddFormValues } from "../datasetAddSchema";

type ProducerSectionProps = {
    organizationsOptions: string[];
};

export default function ProducerSection({ organizationsOptions }: ProducerSectionProps) {
    const { t } = useTranslation("DatasetAdd");
    const { classes } = useStyles();
    const {
        register,
        control,
        formState: { errors, defaultValues },
    } = useFormContext<DatasetAddFormValues>();

    // valeur proposée : le gestionnaire de la donnée lu dans la fiche de métadonnées
    const defaultProducer = defaultValues?.producer;
    const producer = useWatch({ control, name: "producer" });
    const producerChanged = Boolean(defaultProducer) && producer !== "" && producer !== defaultProducer;

    return (
        <div>
            <Controller
                control={control}
                name="producer"
                render={({ field, fieldState: { error } }) => (
                    <AutocompleteSelect
                        label={t("producer.label")}
                        hintText={t("producer.hint")}
                        options={organizationsOptions}
                        state={error ? "error" : "default"}
                        stateRelatedMessage={error?.message}
                        multiple={false}
                        freeSolo
                        autoSelect
                        getOptionLabel={(option) => String(option)}
                        searchFilter={{ limit: undefined }}
                        value={field.value}
                        onChange={(_, value) => field.onChange(value ?? "")}
                        onBlur={field.onBlur}
                        ref={field.ref}
                    />
                )}
            />
            {producerChanged && <Alert className={fr.cx("fr-mb-3w")} severity="warning" small description={t("producer.changed_warning")} />}

            <Input
                label={t("producer_short.label")}
                hintText={t("producer_short.hint", { max: PRODUCER_SHORT_MAX_LENGTH })}
                state={errors.producer_short ? "error" : "default"}
                stateRelatedMessage={errors.producer_short?.message}
                nativeInputProps={{ ...register("producer_short"), maxLength: PRODUCER_SHORT_MAX_LENGTH, className: classes.uppercase }}
            />
        </div>
    );
}

const useStyles = tss.withName({ ProducerSection }).create({
    uppercase: { textTransform: "uppercase" },
});

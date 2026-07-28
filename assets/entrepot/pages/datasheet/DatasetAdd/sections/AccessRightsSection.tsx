import { fr } from "@codegouvfr/react-dsfr";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import ToggleSwitch from "@codegouvfr/react-dsfr/ToggleSwitch";
import { Controller, useFormContext, useWatch } from "react-hook-form";

import { type DatasetAddFormValues } from "../datasetAddSchema";

export default function AccessRightsSection() {
    const { control } = useFormContext<DatasetAddFormValues>();

    const openExtraction = useWatch({ control, name: "open_extraction" });

    return (
        <div>
            <Controller
                control={control}
                name="open_download"
                render={({ field }) => (
                    <ToggleSwitch
                        className={fr.cx("fr-mb-3w")}
                        label="Autoriser le téléchargement"
                        helperText="En acceptant, votre donnée sera téléchargeable par tous les utilisateurs depuis le site cartes.gouv.fr."
                        showCheckedHint={false}
                        labelPosition="right"
                        checked={field.value}
                        onChange={(checked) => field.onChange(checked)}
                    />
                )}
            />

            <Controller
                control={control}
                name="open_extraction"
                render={({ field }) => (
                    <ToggleSwitch
                        className={fr.cx("fr-mb-3w")}
                        label="Autoriser l’extraction"
                        helperText="En acceptant, votre donnée sera disponible à l’extraction par tous les utilisateurs depuis cartes.gouv.fr."
                        showCheckedHint={false}
                        labelPosition="right"
                        checked={field.value}
                        onChange={(checked) => field.onChange(checked)}
                    />
                )}
            />

            {openExtraction && (
                <Controller
                    control={control}
                    name="extraction_public"
                    render={({ field }) => (
                        <Checkbox
                            options={[
                                {
                                    label: "Cochez cette case pour que la donnée soit extractible par tous les utilisateurs de cartes.gouv.fr, à défaut il faudra donner une permission.",
                                    nativeInputProps: {
                                        checked: field.value,
                                        onChange: (e) => field.onChange(e.currentTarget.checked),
                                    },
                                },
                            ]}
                        />
                    )}
                />
            )}
        </div>
    );
}

import { fr } from "@codegouvfr/react-dsfr";
import { Upload } from "@codegouvfr/react-dsfr/Upload";
import { Controller, useFormContext, useWatch } from "react-hook-form";

import { type ServiceFormValues } from "../serviceFormSchema";

/** un fichier SLD obligatoire par table cochée (WMS-V) */
export default function StylesSection() {
    const { control } = useFormContext<ServiceFormValues>();
    const tables = useWatch({ control, name: "tables" }) ?? [];
    const hasSelectedTable = tables.some((table) => table.selected);

    return (
        <div>
            <p className={fr.cx("fr-text--sm")}>Paramétrez un style pour rendre vos données visualisables.</p>
            {!hasSelectedTable && <p className={fr.cx("fr-text--sm")}>Cochez d’abord une ou plusieurs tables.</p>}
            {tables.map((table, index) =>
                table.selected ? (
                    <Controller
                        key={table.native_name}
                        control={control}
                        name={`tables.${index}.style`}
                        render={({ field, fieldState: { error } }) => (
                            <Upload
                                label={`Fichier de style de la table ${table.native_name}`}
                                hint="Fichier SLD. Le style du SLD sera directement utilisé pour cette couche, sans interprétation. Attention : si le fichier est mal configuré il peut être rejeté lors de la publication du flux."
                                state={error ? "error" : "default"}
                                stateRelatedMessage={error?.message}
                                nativeInputProps={{
                                    name: field.name,
                                    ref: field.ref,
                                    onBlur: field.onBlur,
                                    onChange: (e) => field.onChange(e.target.files?.[0]),
                                    accept: ".sld",
                                }}
                                className={fr.cx("fr-input-group")}
                            />
                        )}
                    />
                ) : null
            )}
        </div>
    );
}

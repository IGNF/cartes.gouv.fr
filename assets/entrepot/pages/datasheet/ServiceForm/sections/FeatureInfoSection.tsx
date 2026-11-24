import { fr } from "@codegouvfr/react-dsfr";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import Table from "@codegouvfr/react-dsfr/Table";
import ToggleSwitch from "@codegouvfr/react-dsfr/ToggleSwitch";
import { Controller, useFormContext, useWatch } from "react-hook-form";

import { useTranslation } from "@/i18n";
import { FEATURE_INFO_FORMATS, type ServiceFormValues } from "../serviceFormSchema";

// trois faux attributs pour illustrer le format choisi
const EXAMPLE: [string, string][] = [
    ["toponyme", "La Meuse"],
    ["nature", "Fleuve"],
    ["longueur", "950 km"],
];

type FeatureInfoSectionProps = {
    /** attributs proposés par table (featureInfoColumns) */
    columns: Readonly<Record<string, string[]>>;
};

/** infobulles d’un flux WMS vecteur : attributs affichés par table cochée et format */
export default function FeatureInfoSection({ columns }: FeatureInfoSectionProps) {
    const { t } = useTranslation("ServiceForm");
    const { register, control } = useFormContext<ServiceFormValues>();
    const enabled = useWatch({ control, name: "featureinfo.enabled" });
    const format = useWatch({ control, name: "featureinfo.format" });
    const tables = useWatch({ control, name: "tables" });

    return (
        <div>
            <Controller
                control={control}
                name="featureinfo.enabled"
                render={({ field: { value, onChange } }) => (
                    <ToggleSwitch
                        checked={value}
                        label={t("featureinfo.enabled")}
                        helperText={t("featureinfo.hint")}
                        onChange={(checked) => onChange(checked)}
                        showCheckedHint={false}
                    />
                )}
            />

            {enabled &&
                (tables.some((table) => table.selected) ? (
                    <>
                        <h3 className={fr.cx("fr-text--md", "fr-mt-3w", "fr-mb-1w")}>{t("featureinfo.attributes.legend")}</h3>
                        {tables.map((table, index) =>
                            table.selected ? (
                                // Controller : avec une seule case, register rendrait une chaîne ou false au lieu d’un tableau
                                <Controller
                                    key={table.native_name}
                                    control={control}
                                    name={`tables.${index}.featureinfo_attributes`}
                                    render={({ field: { value, onChange, onBlur, ref }, fieldState: { error } }) => {
                                        const tableColumns = Object.hasOwn(columns, table.native_name) ? columns[table.native_name] : [];
                                        return (
                                            <Checkbox
                                                legend={table.native_name}
                                                hintText={tableColumns.length === 0 ? t("featureinfo.no_attribute") : undefined}
                                                state={error ? "error" : "default"}
                                                stateRelatedMessage={error?.message}
                                                options={tableColumns.map((name, columnIndex) => ({
                                                    label: name,
                                                    nativeInputProps: {
                                                        value: name,
                                                        checked: value.includes(name),
                                                        onBlur,
                                                        // focus sur la première case quand la table est en erreur
                                                        ref: columnIndex === 0 ? ref : undefined,
                                                        // ordre des colonnes, quel que soit l’ordre des clics : pas de faux changement
                                                        onChange: (e) =>
                                                            onChange(
                                                                tableColumns.filter((column) => (column === name ? e.target.checked : value.includes(column)))
                                                            ),
                                                    },
                                                }))}
                                                small
                                            />
                                        );
                                    }}
                                />
                            ) : null
                        )}

                        <RadioButtons
                            legend={t("featureinfo.format.legend")}
                            options={FEATURE_INFO_FORMATS.map((item) => ({
                                label: t(`featureinfo.format.${item}`),
                                nativeInputProps: { ...register("featureinfo.format"), value: item },
                            }))}
                        />

                        <p className={fr.cx("fr-text--sm", "fr-text--bold", "fr-mb-1w")}>{t("featureinfo.example")}</p>
                        {format === "table" ? (
                            <Table headers={EXAMPLE.map(([name]) => name)} data={[EXAMPLE.map(([, value]) => value)]} noCaption />
                        ) : (
                            <ul className={fr.cx("fr-text--sm")}>
                                {EXAMPLE.map(([name, value]) => (
                                    <li key={name}>
                                        <strong>{name}</strong> : {value}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </>
                ) : (
                    <p className={fr.cx("fr-text--sm", "fr-mt-2w")}>{t("featureinfo.no_table")}</p>
                ))}
        </div>
    );
}

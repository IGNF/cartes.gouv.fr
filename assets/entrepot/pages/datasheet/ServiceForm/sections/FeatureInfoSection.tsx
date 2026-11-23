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
    const {
        register,
        control,
        formState: { errors },
    } = useFormContext<ServiceFormValues>();
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
                                <Checkbox
                                    key={table.native_name}
                                    legend={table.native_name}
                                    hintText={columns[table.native_name]?.length === 0 ? t("featureinfo.no_attribute") : undefined}
                                    state={errors.tables?.[index]?.featureinfo_attributes ? "error" : "default"}
                                    stateRelatedMessage={errors.tables?.[index]?.featureinfo_attributes?.message}
                                    options={(columns[table.native_name] ?? []).map((name) => ({
                                        label: name,
                                        nativeInputProps: { ...register(`tables.${index}.featureinfo_attributes`), value: name },
                                    }))}
                                    small
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

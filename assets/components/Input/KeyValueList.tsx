import * as yup from "yup";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";

import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import ToggleSwitch from "@codegouvfr/react-dsfr/ToggleSwitch";
import { useDrag } from "@/hooks/useDrag";
import { DragProvider } from "@/contexts/drag";

import KeyValueItem, { KeyValues } from "./KeyValueItem";
import { InputHTMLAttributes } from "react";
import { SelectProps } from "@codegouvfr/react-dsfr/SelectNext";
import { get } from "@/utils";
import { getTranslation } from "@/i18n";

export interface KeyValuesForm {
    values: KeyValues;
    useKeys: boolean;
}

const { t } = getTranslation("KeyValueList");

function checkDuplicates({ useKeys, values }: KeyValuesForm) {
    const attribute = useKeys ? "key" : "value";
    const items = values.map((item) => item[attribute]);
    return new Set(items).size === items.length;
}

export function getKeyValueSchema(testConfig?: yup.TestConfig<string | null> | yup.TestConfig<string | null>[]) {
    let valueSchema = yup.string().nullable().defined().strict(true);
    if (testConfig) {
        const tests: yup.TestConfig<string | null>[] = testConfig instanceof Array ? testConfig : [testConfig];
        tests.forEach((test) => {
            valueSchema = valueSchema.test(test);
        });
    }
    return yup
        .object({
            useKeys: yup.boolean().required(),
            values: yup
                .array()
                .of(
                    yup.object({
                        key: yup.string(),
                        value: valueSchema,
                    })
                )
                .required(),
        })
        .test("hasDuplicates", t("has_duplicates_error"), checkDuplicates);
}

interface KeyValueListProps {
    label: string;
    hintText?: string;
    name: string;
    valueInputProps?: InputHTMLAttributes<HTMLInputElement>;
    valueOptions?: SelectProps.Option[];
    valueType?: "textInput" | "select";
}

function KeyValueList(props: KeyValueListProps) {
    const { label, hintText, name, valueInputProps, valueOptions, valueType } = props;
    const {
        control,
        formState: { errors },
    } = useFormContext();
    const { fields, append, remove, move } = useFieldArray({
        name: `${name}.values`,
    });
    const keyValueError = get(errors, `${name}.message`) ?? get(errors, `${name}.root.message`);
    const hasError = Boolean(keyValueError);
    const drag = useDrag(move);

    function handleAdd() {
        append({ key: "", value: "" });
    }

    return (
        <div className={fr.cx("fr-input-group", { "fr-input-group--error": hasError })}>
            <label className={fr.cx("fr-label")}>
                {label}
                {hintText && <span className={fr.cx("fr-hint-text")}>{hintText}</span>}
            </label>
            <div className={fr.cx("fr-mt-1w", "fr-mb-1w")}>
                <Controller
                    control={control}
                    name={`${name}.useKeys`}
                    render={({ field: { value, onChange } }) => (
                        <ToggleSwitch checked={value} label={t("define_keys")} inputTitle={t("define_keys")} onChange={onChange} showCheckedHint={false} />
                    )}
                />
            </div>
            <DragProvider value={drag}>
                {fields.map((field, i) => {
                    return (
                        <KeyValueItem
                            key={field.id}
                            index={i}
                            name={name}
                            onRemove={remove}
                            valueInputProps={valueInputProps}
                            valueOptions={valueOptions}
                            valueType={valueType}
                        />
                    );
                })}
            </DragProvider>
            <div>
                <Button className={fr.cx("fr-mr-1v")} iconId={"fr-icon-add-circle-line"} priority="tertiary" onClick={handleAdd} type="button">
                    Ajouter
                </Button>
            </div>
            {hasError && <p className={fr.cx("fr-error-text")}>{String(keyValueError)}</p>}
        </div>
    );
}

export default KeyValueList;

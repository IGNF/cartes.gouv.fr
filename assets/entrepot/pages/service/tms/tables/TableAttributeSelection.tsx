import { fr } from "@codegouvfr/react-dsfr";
import { Accordion } from "@codegouvfr/react-dsfr/Accordion";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import { FC, useEffect } from "react";
import { type FieldError, type UseFormReturn } from "react-hook-form";

import { type StoredDataRelation } from "../../../../../@types/app";
import { useTranslation } from "../../../../../i18n";

type TableAttributeSelectionProps = {
    visible: boolean;
    form: UseFormReturn;
    selectedTables: StoredDataRelation[];
};

const TableAttributeSelection: FC<TableAttributeSelectionProps> = ({ visible, form, selectedTables }) => {
    const { t } = useTranslation("PyramidVectorGenerateForm");
    const { t: tCommon } = useTranslation("Common");

    const {
        setValue: setFormValue,
        getValues: getFormValues,
        formState: { errors },
    } = form;

    const tableAttributes = (getFormValues("table_attributes") as Record<string, string[]> | undefined) ?? {};
    const tableAttributesErrors = errors?.table_attributes as Partial<Record<string, FieldError>> | undefined;

    useEffect(() => {
        const prevTableAttributes = (getFormValues("table_attributes") as Record<string, string[]> | undefined) ?? {};
        const tableAttributes: Record<string, string[]> = {};
        selectedTables.forEach((table) => {
            tableAttributes[table.name] = prevTableAttributes[table.name] ?? [];
        });

        setFormValue("table_attributes", tableAttributes);
    }, [getFormValues, setFormValue, selectedTables]);

    const toggleAttributes = (tableName: string, attrName: string, tableAttributes: string[]) => {
        let tableAttr = [...tableAttributes];

        if (tableAttr.includes(attrName)) {
            tableAttr = tableAttr.filter((el) => el !== attrName);
        } else {
            tableAttr.push(attrName);
            tableAttr = Array.from(new Set(tableAttr));
        }

        setFormValue(`table_attributes.${tableName}`, tableAttr, { shouldValidate: true });
    };

    return (
        <div className={fr.cx(!visible && "fr-hidden")}>
            <h3>{t("step_attributes.label")}</h3>
            <p>{tCommon("mandatory_fields")}</p>

            {selectedTables.map((table) => (
                <Accordion key={table.name} label={table.name} titleAs="h4" defaultExpanded={true}>
                    <Checkbox
                        options={Object.keys(table.attributes)
                            .filter((attrName) => {
                                return !table.attributes[attrName].startsWith("geometry");
                            })
                            .sort()
                            .map((attrName) => ({
                                label: attrName,
                                nativeInputProps: {
                                    value: attrName,
                                    checked: tableAttributes?.[table.name]?.includes(attrName) ?? false,
                                    onChange: () => toggleAttributes(table.name, attrName, tableAttributes[table.name]),
                                },
                            }))}
                        state={tableAttributesErrors?.[table.name]?.message ? "error" : "default"}
                        stateRelatedMessage={tableAttributesErrors?.[table.name]?.message?.toString()}
                    />
                </Accordion>
            ))}
        </div>
    );
};

export default TableAttributeSelection;

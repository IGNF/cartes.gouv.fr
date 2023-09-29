import { fr } from "@codegouvfr/react-dsfr";
import { Accordion } from "@codegouvfr/react-dsfr/Accordion";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import { FC, useEffect, useState } from "react";
import { type UseFormReturn } from "react-hook-form";

import Translator from "../../../../modules/Translator";
import { type StoredDataRelation } from "../../../../types/app";

type TableAttributeSelectionProps = {
    visible: boolean;
    form: UseFormReturn;
    selectedTables: StoredDataRelation[];
};

const TableAttributeSelection: FC<TableAttributeSelectionProps> = ({ visible, form, selectedTables }) => {
    const {
        trigger,
        setValue: setFormValue,
        getValues: getFormValues,
        formState: { errors },
    } = form;

    const [tableAttributes, setTableAttributes] = useState<Record<string, string[]>>({});

    useEffect(() => {
        const prevTableAttributes = getFormValues("table_attributes") ?? {};
        const tableAttributes = {};
        selectedTables.forEach((table) => {
            tableAttributes[table.name] = prevTableAttributes[table.name] ?? [];
        });
        setTableAttributes(tableAttributes);
    }, [getFormValues, selectedTables]);

    const toggleAttributes = (tableName: string, attrName: string) => {
        setTableAttributes((prevState) => {
            let tableAttr: string[] = prevState[tableName];

            if (tableAttr.includes(attrName)) {
                tableAttr = tableAttr.filter((el) => el !== attrName);
            } else {
                tableAttr.push(attrName);
                tableAttr = Array.from(new Set(tableAttr));
            }

            prevState[tableName] = tableAttr;
            return { ...prevState };
        });
        trigger(`table_attributes.${tableName}`);
    };

    useEffect(() => {
        setFormValue("table_attributes", tableAttributes);
    }, [tableAttributes, setFormValue]);

    return (
        <div className={fr.cx(!visible && "fr-hidden")}>
            <h3>{Translator.trans("choose_attributes")}</h3>
            <p>{Translator.trans("mandatory_fields")}</p>

            {selectedTables.map((table) => (
                <Accordion key={table.name} label={table.name} titleAs="h4" defaultExpanded={true}>
                    <Checkbox
                        options={Object.keys(table.attributes)
                            .filter((attrName) => {
                                return !/^geometry/.test(table.attributes[attrName]);
                            })
                            .sort()
                            .map((attrName) => ({
                                label: attrName,
                                nativeInputProps: {
                                    value: attrName,
                                    checked: tableAttributes?.[table.name]?.includes(attrName) ?? false,
                                    onChange: () => toggleAttributes(table.name, attrName),
                                },
                            }))}
                        state={errors?.table_attributes?.[table.name]?.message ? "error" : "default"}
                        stateRelatedMessage={errors?.table_attributes?.[table.name]?.message?.toString()}
                    />
                </Accordion>
            ))}
        </div>
    );
};

export default TableAttributeSelection;

import { fr } from "@codegouvfr/react-dsfr";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import { FC, useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";

import { StoredDataRelation, VectorDb } from "../../../../types/app";

type TableAttributeSelectionProps = {
    vectorDb: VectorDb;
    visible: boolean;
    form: UseFormReturn;
};
const TableAttributeSelection: FC<TableAttributeSelectionProps> = ({ vectorDb, visible, form }) => {
    const {
        watch,
        trigger,
        setValue: setFormValue,
        getValues: getFormValues,
        formState: { errors },
    } = form;

    const selectedTableNamesList: string[] = watch("selected_tables");

    const [selectedTables, setSelectedTables] = useState<StoredDataRelation[]>([]);
    const [tableAttributes, setTableAttributes] = useState<{ [tableName: string]: string[] }>({});

    useEffect(() => {
        if (selectedTableNamesList) {
            const relations = vectorDb.type_infos?.relations ?? [];
            const tables = relations.filter((rel) => rel.type && rel.type === "TABLE");
            const selectedTables = tables.filter((table) => selectedTableNamesList.includes(table.name));
            setSelectedTables(selectedTables);

            const prevTableAttributes = getFormValues("table_attributes") ?? {};
            const tableAttributes = {};
            selectedTables.forEach((table) => {
                tableAttributes[table.name] = prevTableAttributes[table.name] ?? [];
            });
            setTableAttributes(tableAttributes);
        }
    }, [getFormValues, selectedTableNamesList, vectorDb.type_infos?.relations]);

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
        trigger();
    };

    useEffect(() => {
        setFormValue("table_attributes", tableAttributes);
    }, [tableAttributes, setFormValue]);

    return (
        <div className={fr.cx(!visible && "fr-hidden")}>
            {/* <ul>
                {selectedTables.map((table) => (
                    <li key={table.name}>
                        <p>{table.name}</p>
                        <ul>
                            {Object.keys(table.attributes).map((attrName) => (
                                <li key={attrName}>
                                    {attrName} : {tableAttributes?.[table.name].includes(attrName) ? "checked" : ""}
                                </li>
                            ))}
                        </ul>
                    </li>
                ))}
            </ul> */}

            {selectedTables.map((table) => (
                <Checkbox
                    key={table.name}
                    legend={table.name}
                    options={Object.keys(table.attributes).map((attrName) => ({
                        label: attrName,
                        nativeInputProps: {
                            value: attrName,
                            checked: tableAttributes?.[table.name].includes(attrName),
                            onChange: () => toggleAttributes(table.name, attrName),
                        },
                    }))}
                    state={errors?.[`table_attributes_${table.name}`]?.message ? "error" : "default"}
                    stateRelatedMessage={errors?.[`table_attributes_${table.name}`]?.message?.toString()}
                />
            ))}
        </div>
    );
};

export default TableAttributeSelection;

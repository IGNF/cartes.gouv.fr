import { fr } from "@codegouvfr/react-dsfr";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { FC, useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";

import { type VectorDb } from "../../../../types/app";

type TablesSelectionProps = {
    vectorDb: VectorDb;
    visible: boolean;
    form: UseFormReturn;
};
const TableSelection: FC<TablesSelectionProps> = ({ vectorDb, visible, form }) => {
    const {
        formState: { errors },
        setValue: setFormValue,
        trigger,
    } = form;

    const relations = vectorDb.type_infos?.relations || [];
    const tables = relations.filter((rel) => rel?.type === "TABLE");

    const [selectedTables, setSelectedTables] = useState<string[]>([]);

    const toggleTable = (tableName: string) => {
        setSelectedTables((prevState) => {
            if (prevState.includes(tableName)) {
                prevState = prevState.filter((el) => el !== tableName);
            } else {
                prevState.push(tableName);
            }

            return Array.from(new Set(prevState));
        });
        trigger();
    };

    useEffect(() => {
        setFormValue("selected_tables", selectedTables);
    }, [selectedTables, setFormValue]);

    return (
        <div className={fr.cx(!visible && "fr-hidden")}>
            <Checkbox
                options={tables.map((table) => ({
                    label: table.name,
                    nativeInputProps: {
                        value: table.name,
                        onChange: () => toggleTable(table.name),
                        checked: selectedTables.includes(table.name),
                    },
                }))}
                legend="Sélectionnez les tables nécessaires au service"
                hintText={<strong>{tables.length} table(s) détectée(s) </strong>}
                state={errors.selected_tables ? "error" : "default"}
                stateRelatedMessage={errors?.selected_tables?.message?.toString()}
            />
        </div>
    );
};

export default TableSelection;

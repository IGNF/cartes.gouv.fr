import { fr } from "@codegouvfr/react-dsfr";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { FC } from "react";
import { type UseFormReturn } from "react-hook-form";

import { filterGeometricRelations } from "../../helpers";
import Translator from "../../modules/Translator";
import { type VectorDb } from "../../types/app";

type TablesSelectionProps = {
    filterGeometric?: boolean;
    vectorDb: VectorDb;
    visible: boolean;
    form: UseFormReturn;
};

const TableSelection: FC<TablesSelectionProps> = ({ filterGeometric = false, vectorDb, visible, form }) => {
    const {
        formState: { errors },
        setValue: setFormValue,
        watch,
    } = form;

    const relations = vectorDb.type_infos?.relations || [];
    const tables = filterGeometricRelations(relations, filterGeometric);

    const selectedTables = watch("selected_tables") ?? [];

    const toggleTable = (tableName: string) => {
        let prevSelectedTables = [...selectedTables];

        if (prevSelectedTables.includes(tableName)) {
            prevSelectedTables = prevSelectedTables.filter((el) => el !== tableName);
        } else {
            prevSelectedTables.push(tableName);
        }

        setFormValue("selected_tables", Array.from(new Set(prevSelectedTables)), { shouldValidate: true });
    };

    return (
        <div className={fr.cx(!visible && "fr-hidden")}>
            <h3>{Translator.trans("service.wms_vector.new.step_tables.title")}</h3>

            <p>{Translator.trans("mandatory_fields")}</p>

            <Checkbox
                options={tables.map((table) => ({
                    label: table.name,
                    nativeInputProps: {
                        value: table.name,
                        onChange: () => toggleTable(table.name),
                        checked: selectedTables.includes(table.name),
                    },
                }))}
                hintText={<strong>{tables.length} table(s) détectée(s) </strong>}
                state={errors.selected_tables ? "error" : "default"}
                stateRelatedMessage={errors?.selected_tables?.message?.toString()}
            />
        </div>
    );
};

export default TableSelection;

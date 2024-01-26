import { fr } from "@codegouvfr/react-dsfr";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { FC, useCallback, useMemo } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";

import { filterGeometricRelations } from "../../helpers";
import Translator from "../../modules/Translator";
import { type VectorDb } from "../../types/app";
import { WmsVectorServiceFormType } from "./wms-vector/WmsVectorServiceNew";

type TablesSelectionProps = {
    filterGeometric?: boolean;
    vectorDb: VectorDb;
    visible: boolean;
    form: UseFormReturn<WmsVectorServiceFormType>;
};

const TableSelection: FC<TablesSelectionProps> = ({ filterGeometric = false, vectorDb, visible, form }) => {
    const {
        formState: { errors },
        setValue: setFormValue,
    } = form;

    const tables = useMemo(() => {
        const relations = vectorDb.type_infos?.relations || [];
        return filterGeometricRelations(relations, filterGeometric);
    }, [filterGeometric, vectorDb.type_infos?.relations]);

    const selectedTableNamesList: string[] = useWatch({
        control: form.control,
        name: "selected_tables",
    });

    const toggleTable = useCallback(
        (tableName: string) => {
            let prevSelectedTables = [...selectedTableNamesList];

            if (prevSelectedTables.includes(tableName)) {
                prevSelectedTables = prevSelectedTables.filter((el) => el !== tableName);
            } else {
                prevSelectedTables.push(tableName);
            }

            setFormValue("selected_tables", Array.from(new Set(prevSelectedTables)), { shouldValidate: true });
        },
        [selectedTableNamesList, setFormValue]
    );

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
                        checked: selectedTableNamesList.includes(table.name),
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

import { fr } from "@codegouvfr/react-dsfr";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { FC, useCallback, useMemo } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";

import { type VectorDb } from "../../../../../@types/app";
import { filterGeometricRelations } from "../../../../../helpers";
import { useTranslation } from "../../../../../i18n/i18n";
import { type PyramidVectorGenerateFormValuesType } from "../../tms/PyramidVectorGenerateForm";
import { type WmsVectorServiceFormValuesType } from "../../wms-vector/WmsVectorServiceForm";

type TablesSelectionProps = {
    filterGeometric?: boolean;
    vectorDb: VectorDb;
    visible: boolean;
    form: UseFormReturn<WmsVectorServiceFormValuesType | PyramidVectorGenerateFormValuesType>;
};

const TableSelection: FC<TablesSelectionProps> = ({ filterGeometric = false, vectorDb, visible, form }) => {
    const { t } = useTranslation("TableSelection");
    const { t: tCommon } = useTranslation("Common");

    const {
        formState: { errors },
        setValue: setFormValue,
    } = form;

    const tables = useMemo(() => {
        const relations = vectorDb.type_infos?.relations || [];
        return filterGeometricRelations(relations, filterGeometric);
    }, [filterGeometric, vectorDb.type_infos?.relations]);

    const selectedTableNamesList: string[] | undefined = useWatch({
        control: form.control,
        name: "selected_tables",
        defaultValue: [],
    });

    const toggleTable = useCallback(
        (tableName: string) => {
            let prevSelectedTables = selectedTableNamesList ? [...selectedTableNamesList] : [];

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
            <h3>{t("title")}</h3>

            <p>{tCommon("mandatory_fields")}</p>

            <p>
                <strong>{t("tables_detected_hint", { nbTables: tables.length })}</strong>
            </p>

            <Checkbox
                options={tables.map((table) => ({
                    label: table.name,
                    nativeInputProps: {
                        value: table.name,
                        onChange: () => toggleTable(table.name),
                        checked: selectedTableNamesList?.includes(table.name),
                    },
                }))}
                state={errors.selected_tables ? "error" : "default"}
                stateRelatedMessage={errors?.selected_tables?.message?.toString()}
            />
        </div>
    );
};

export default TableSelection;

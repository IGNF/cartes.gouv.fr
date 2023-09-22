import { fr } from "@codegouvfr/react-dsfr";
import { FC, useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { StoredDataRelation } from "../../../../types/app";
import Translator from "../../../../modules/Translator";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import ZoomRange from "../../../../components/Utils/ZoomRange";

type TableZoomLevelsProps = {
    visible: boolean;
    form: UseFormReturn;
    selectedTables: StoredDataRelation[];
};

const ZoomLevels = {
    TOP: 5,
    BOTTOM: 18,
};

const TableZoomLevels: FC<TableZoomLevelsProps> = ({ visible, form, selectedTables }) => {
    const [tableZoomLevels, setTableZoomLevels] = useState<Record<string, number[]>>({});

    const {
        // trigger,
        setValue: setFormValue,
        getValues: getFormValues,
        // formState: { errors },
    } = form;

    useEffect(() => {
        const prevTableZoomLevels = getFormValues("table_zoom_levels") ?? {};
        const tableZoomLevels = {};
        selectedTables.forEach((table) => {
            tableZoomLevels[table.name] = prevTableZoomLevels[table.name] ?? [ZoomLevels.TOP, ZoomLevels.BOTTOM];
        });
        setTableZoomLevels(tableZoomLevels);
        setFormValue("table_zoom_levels", tableZoomLevels);
    }, [getFormValues, setFormValue, selectedTables]);

    useEffect(() => {
        setFormValue("table_zoom_levels", tableZoomLevels);
    }, [tableZoomLevels, setFormValue]);

    const onZoomChanged = (tableName, values: number[]) => {
        const v = {};
        v[tableName] = values;
        const zoomLevels = { ...tableZoomLevels, ...v };
        setTableZoomLevels(zoomLevels);
    };

    return (
        <div className={fr.cx(!visible && "fr-hidden")}>
            <h3>{Translator.trans("service.tms.new.step_zoom_levels.title")}</h3>
            <p>{Translator.trans("service.tms.new.step_zoom_levels.explain")}</p>
            {selectedTables.map((table) => (
                <Accordion key={table.name} label={table.name} titleAs="h4" defaultExpanded={true}>
                    <ZoomRange
                        min={ZoomLevels.TOP}
                        max={ZoomLevels.BOTTOM}
                        initialValues={tableZoomLevels[table.name]}
                        onChange={(values) => onZoomChanged(table.name, values)}
                    />
                </Accordion>
            ))}
        </div>
    );
};

export default TableZoomLevels;

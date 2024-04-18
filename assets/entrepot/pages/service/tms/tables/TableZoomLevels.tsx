import { fr } from "@codegouvfr/react-dsfr";
import { FC, useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { StoredDataRelation } from "../../../../../@types/app";
import Translator from "../../../../../modules/Translator";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import ZoomRange from "../../../../../components/Utils/ZoomRange";
import olDefaults from "../../../../../data/ol-defaults.json";

type TableZoomLevelsProps = {
    visible: boolean;
    form: UseFormReturn;
    selectedTables: StoredDataRelation[];
    onChange?: (values: number[]) => void;
};

const TableZoomLevels: FC<TableZoomLevelsProps> = ({ visible, form, selectedTables }) => {
    const [tableZoomLevels, setTableZoomLevels] = useState<Record<string, number[]>>({});

    const { setValue: setFormValue, getValues: getFormValues } = form;

    useEffect(() => {
        const prevTableZoomLevels = getFormValues("table_zoom_levels") ?? {};
        const tableZoomLevels = {};
        selectedTables.forEach((table) => {
            tableZoomLevels[table.name] = prevTableZoomLevels[table.name] ?? [olDefaults.zoom_levels.TOP, olDefaults.zoom_levels.BOTTOM];
        });
        setTableZoomLevels(tableZoomLevels);
    }, [getFormValues, setFormValue, selectedTables]);

    useEffect(() => {
        const getBottomLevel = () => {
            let level = -1;
            Object.values(tableZoomLevels).forEach((levels) => {
                if (levels[1] > level) level = levels[1];
            });
            return level === -1 ? olDefaults.zoom_levels.BOTTOM : level;
        };

        setFormValue("table_zoom_levels", tableZoomLevels);
        setFormValue("bottom_zoom_level", getBottomLevel());
    }, [tableZoomLevels, setFormValue]);

    const onZoomChanged = (tableName, values: number[]) => {
        const v = {};
        v[tableName] = values;
        const zoomLevels = { ...tableZoomLevels, ...v };
        setTableZoomLevels(zoomLevels);
    };

    return (
        <div className={fr.cx("fr-my-2v", !visible && "fr-hidden")}>
            <h3>{Translator.trans("pyramid_vector.new.step_zoom_levels.title")}</h3>
            <p>{Translator.trans("pyramid_vector.new.step_zoom_levels.explain")}</p>
            {selectedTables.map((table) => (
                <Accordion key={table.name} label={table.name} titleAs="h4" defaultExpanded={true}>
                    <ZoomRange
                        min={olDefaults.zoom_levels.TOP}
                        max={olDefaults.zoom_levels.BOTTOM}
                        initialValues={tableZoomLevels[table.name]}
                        onChange={(values) => onZoomChanged(table.name, values)}
                    />
                </Accordion>
            ))}
        </div>
    );
};

export default TableZoomLevels;

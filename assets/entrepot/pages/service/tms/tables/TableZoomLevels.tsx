import { fr } from "@codegouvfr/react-dsfr";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import { FC, useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";

import { StoredDataRelation } from "../../../../../@types/app";
import ZoomRange from "../../../../../components/Utils/ZoomRange";
import olDefaults from "../../../../../data/ol-defaults.json";
import { useTranslation } from "../../../../../i18n";
import { PyramidVectorGenerateFormValuesType } from "../PyramidVectorGenerateForm/PyramidVectorGenerateForm";

type TableZoomLevelsProps = {
    visible: boolean;
    form: UseFormReturn<PyramidVectorGenerateFormValuesType>;
    selectedTables: StoredDataRelation[];
};

const TableZoomLevels: FC<TableZoomLevelsProps> = ({ visible, form, selectedTables }) => {
    const { t } = useTranslation("PyramidVectorGenerateForm");

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
            <h3>{t("step_zoom_levels.label")}</h3>
            <p>{t("step_zoom_levels.explanation")}</p>

            {visible &&
                selectedTables.map((table) => (
                    <Accordion key={table.name} label={table.name} titleAs="h4" defaultExpanded={true}>
                        <ZoomRange
                            min={olDefaults.zoom_levels.TOP}
                            max={olDefaults.zoom_levels.BOTTOM}
                            values={tableZoomLevels[table.name]}
                            onChange={(values) => onZoomChanged(table.name, values)}
                        />
                    </Accordion>
                ))}
        </div>
    );
};

export default TableZoomLevels;

import { fr } from "@codegouvfr/react-dsfr";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import { FC, useCallback, useEffect } from "react";
import { UseFormReturn, useWatch } from "react-hook-form";

import { StoredDataRelation } from "../../../../../@types/app";
import ZoomRange from "../../../../../components/Utils/ZoomRange";
import olDefaults from "../../../../../data/ol-defaults.json";
import { useTranslation } from "../../../../../i18n";
import { PyramidVectorGenerateFormValuesType } from "../PyramidVectorGenerateForm/PyramidVectorGenerateForm";

const DEFAULT_ZOOM_LEVELS = [olDefaults.zoom_levels.TOP, olDefaults.zoom_levels.BOTTOM];

type TableZoomLevelsProps = {
    visible: boolean;
    form: UseFormReturn<PyramidVectorGenerateFormValuesType>;
    selectedTables: StoredDataRelation[];
};

const TableZoomLevels: FC<TableZoomLevelsProps> = ({ visible, form, selectedTables }) => {
    const { t } = useTranslation("PyramidVectorGenerateForm");

    const { control, setValue: setFormValue, getValues: getFormValues } = form;
    const tableZoomLevels = useWatch({ control, name: "table_zoom_levels" }) ?? {};

    const saveZoomLevels = useCallback(
        (zoomLevels: Record<string, number[]>) => {
            let bottomLevel = -1;
            Object.values(zoomLevels).forEach((levels) => {
                if (levels[1] > bottomLevel) bottomLevel = levels[1];
            });

            setFormValue("table_zoom_levels", zoomLevels);
            setFormValue("bottom_zoom_level", bottomLevel === -1 ? olDefaults.zoom_levels.BOTTOM : bottomLevel);
        },
        [setFormValue]
    );

    // ne garder que les tables sélectionnées, avec les niveaux par défaut pour les nouvelles
    useEffect(() => {
        const prevTableZoomLevels = getFormValues("table_zoom_levels") ?? {};
        const zoomLevels: Record<string, number[]> = {};
        selectedTables.forEach((table) => {
            zoomLevels[table.name] = prevTableZoomLevels[table.name] ?? DEFAULT_ZOOM_LEVELS;
        });
        saveZoomLevels(zoomLevels);
    }, [getFormValues, saveZoomLevels, selectedTables]);

    const onZoomChanged = (tableName: string, values: number[]) => {
        saveZoomLevels({ ...tableZoomLevels, [tableName]: values });
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
                            values={tableZoomLevels[table.name] ?? DEFAULT_ZOOM_LEVELS}
                            onChange={(values) => onZoomChanged(table.name, values)}
                        />
                    </Accordion>
                ))}
        </div>
    );
};

export default TableZoomLevels;

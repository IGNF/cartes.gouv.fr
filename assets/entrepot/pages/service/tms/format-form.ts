import type { PyramidVectorGenerateFormValuesType } from "./PyramidVectorGenerateForm/PyramidVectorGenerateForm";

type CompositionType = {
    table: string;
    attributes: string[];
    bottom_level: number;
    top_level: number;
};

const getComposition = (attributes: Record<string, string[]>, zoomLevels: Record<string, number[]>) => {
    const composition: CompositionType[] = [];
    Object.keys(attributes).forEach((table) => {
        composition.push({
            table: table,
            attributes: attributes[table],
            bottom_level: zoomLevels[table][1],
            top_level: zoomLevels[table][0],
        });
    });
    return composition;
};

const format = (technicalName: string, vectorDbId: string, values: PyramidVectorGenerateFormValuesType) => {
    const composition = getComposition(values.table_attributes!, values.table_zoom_levels!);

    const result: Record<string, unknown> = {
        technical_name: technicalName,
        composition: composition,
        tippecanoe: values.tippecanoe,
        vectordb_id: vectorDbId,
        email_notification: values.email_notification === true,
    };

    return result;
};

export default format;

type CompositionType = {
    table: string;
    attributes: string[];
    bottom_level: number;
    top_level: number;
};

const getComposition = (attributes, zoomLevels) => {
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

const format = (technicalName, values) => {
    const composition = getComposition(values.table_attributes, values.table_zoom_levels);

    const result = {
        technicalName: technicalName,
        composition: composition,
        tippecanoe: values.tippecanoe,
    };
    if (values.sample.is_sample === "true") {
        result["area"] = values.sample.area;
    }

    return result;
};

export default format;

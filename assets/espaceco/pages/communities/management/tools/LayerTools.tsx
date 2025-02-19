import { CommunityFeatureTypeLayer, LayerGeometryType, PartialCommunityFeatureTypeLayer } from "@/@types/app_espaceco";
import { LayerTools, LayerToolsType, RefLayerToolsType } from "@/@types/espaceco";

const getAvailableTools = (geometryType: LayerGeometryType): LayerToolsType[] => {
    switch (geometryType) {
        case "Point":
        case "MultiPoint":
            return ["draw", "translate", "delete", "copy_paste"];
        default:
            return [...LayerTools];
    }
};

const getAvailableRefTools = (geometryType: LayerGeometryType): RefLayerToolsType[] => {
    switch (geometryType) {
        case "Point":
        case "MultiPoint":
            return [];
        case "LineString":
        case "MultiLineString":
            return ["snap", "shortestpath"];
        case "Polygon":
        case "MultiPolygon":
            return ["snap"];
    }
};

const getEditableLayers = (layers?: Record<string, CommunityFeatureTypeLayer[]>): Record<string, Record<number, PartialCommunityFeatureTypeLayer>> => {
    if (!layers || Object.keys(layers).length === 0) {
        return {};
    }

    const result = {};
    for (const [dbname, lays] of Object.entries(layers)) {
        const fLayers = lays.filter((l) => l.role === "edit" || l.role === "ref-edit");
        if (!fLayers.length) {
            continue;
        }

        const editLayers = fLayers.reduce((accumulator, l) => {
            const availables = getAvailableTools(l.geometry_type);
            accumulator[l.id] = {
                table_name: l.table_name,
                geometry_type: l.geometry_type,
                tools: l.tools?.filter((t) => availables.includes(t)) ?? [],
                ref_tools: l.ref_tools,
            };
            return accumulator;
        }, {});
        result[dbname] = editLayers;
    }
    return result;
};

const getRefLayers = (
    tool: RefLayerToolsType,
    layers?: Record<string, CommunityFeatureTypeLayer[]>
): Record<string, Record<number, PartialCommunityFeatureTypeLayer>> => {
    if (!layers || Object.keys(layers).length === 0) {
        return {};
    }

    const availableGeometries: LayerGeometryType[] =
        tool === "snap" ? ["LineString", "MultiLineString", "Polygon", "MultiPolygon"] : ["LineString", "MultiLineString"];

    return Object.values(layers).reduce((accumulator, array) => {
        const lays = array.reduce((acc, l) => {
            if (availableGeometries.includes(l.geometry_type)) {
                acc[l.id] = {
                    table_name: l.table_name,
                    geometry_type: l.geometry_type,
                };
            }
            return acc;
        }, {});
        accumulator = { ...accumulator, ...lays };
        return accumulator;
    }, {});
};

const getLayerTools = (editableLayers: Record<string, Record<number, PartialCommunityFeatureTypeLayer>>): Record<number, LayerToolsType[]> => {
    const layerTools: Record<number, LayerToolsType[]> = {};
    for (const layers of Object.values(editableLayers)) {
        for (const [id, config] of Object.entries(layers)) {
            layerTools[id] = config.tools;
        }
    }
    return layerTools;
};

const getRefTools = (editableLayers: Record<string, Record<number, PartialCommunityFeatureTypeLayer>>): Record<number, Record<RefLayerToolsType, number[]>> => {
    const refTools = {};
    for (const layers of Object.values(editableLayers)) {
        for (const [id, config] of Object.entries(layers)) {
            const availableRefTools = getAvailableRefTools(config.geometry_type);
            if (!availableRefTools.length) {
                continue;
            }

            const emptyTools = availableRefTools.reduce((acc, tool) => {
                acc[tool] = [];
                return acc;
            }, {});

            const tools = Array.isArray(config.ref_tools) ? {} : config.ref_tools;
            refTools[id] = Object.keys(tools).length === 0 ? emptyTools : config.ref_tools;
        }
    }
    return refTools;
};

export { getEditableLayers, getRefLayers, getAvailableTools, getAvailableRefTools, getLayerTools, getRefTools };

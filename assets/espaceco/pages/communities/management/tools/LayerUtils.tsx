import { CommunitiesLayers, CommunityFeatureTypeLayer, geometryTypes, LayerGeometryType, RefToolLayer, RefTools, ToolsFormType } from "@/@types/app_espaceco";
import { arrRefLayerTools, LayerTools, RefLayerTools } from "@/@types/espaceco";

const allTypesTools: LayerTools[] = ["draw", "translate", "delete", "snap_mandatory", "copy_paste"];

const getAvailableTools = (geometryType: LayerGeometryType): LayerTools[] => {
    switch (geometryType) {
        case "Point":
        case "MultiPoint":
            return allTypesTools;
        case "LineString":
        case "MultiLineString":
            return [...allTypesTools, "modify", "split"];
        case "Polygon":
        case "MultiPolygon":
            return [...allTypesTools, "modify"];
    }
};

const getAvailableRefTools = (geometryType: LayerGeometryType): RefLayerTools[] => {
    switch (geometryType) {
        case "Point":
        case "MultiPoint":
        case "Polygon":
        case "MultiPolygon":
            return ["snap"];
        case "LineString":
        case "MultiLineString":
            return ["snap", "shortestpath"];
    }
};

const getRefTools = (refs: Record<number, string>, refTools: Record<RefLayerTools, number[]>, availableRefTools: RefLayerTools[]): RefTools => {
    const rt = refTools === null ? {} : typeof refTools === "string" ? JSON.parse(refTools) : Array.isArray(refTools) && refTools.length === 0 ? {} : refTools;

    const result = {};
    arrRefLayerTools.forEach((t) => {
        let layers = [];
        if (t in rt && availableRefTools.includes(t)) {
            layers = rt[t].reduce((acc, layerId) => {
                if (layerId in refs) {
                    acc.push({ id: layerId.toString(), name: refs[layerId] });
                }
                return acc;
            }, []);
        }
        result[t] = {
            active: t in rt && availableRefTools.includes(t),
            layers: layers,
        };
    });
    return result as RefTools;
};

const getEditableLayers = (layers?: Record<string, CommunityFeatureTypeLayer[]>): CommunitiesLayers => {
    if (!layers || Object.keys(layers).length === 0) {
        return {};
    }

    // Les couches de référence
    const refs: Record<number, string> = Object.values(layers).reduce((accumulator, layers) => {
        const lays = layers.reduce((acc, l) => {
            acc[l.id] = `${l.database_title}:${l.table_title}`;
            return acc;
        }, {});
        accumulator = { ...accumulator, ...lays };
        return accumulator;
    }, {});

    const result = {};
    for (const [dbTitle, lays] of Object.entries(layers)) {
        const fLayers = lays.filter((l) => l.role === "edit" || l.role === "ref-edit");
        if (!fLayers.length) {
            continue;
        }

        const editLayers = fLayers.reduce((accumulator, l) => {
            const availablestools = getAvailableTools(l.geometry_type);
            const availableRefTools = getAvailableRefTools(l.geometry_type);

            const ref_tools = getRefTools(refs, l.ref_tools, availableRefTools);
            accumulator[l.id] = {
                id: l.id,
                table_title: l.table_title,
                geometry_type: l.geometry_type,
                tools: l.tools?.filter((t) => availablestools.includes(t)) ?? [],
                ref_tools: ref_tools,
            };
            return accumulator;
        }, {});
        result[dbTitle] = editLayers;
    }
    return result;
};

const getRefLayers = (tool: RefLayerTools, layers?: Record<string, CommunityFeatureTypeLayer[]>): RefToolLayer[] => {
    if (!layers || Object.keys(layers).length === 0) {
        return [];
    }

    const availableGeometries: LayerGeometryType[] = tool === "snap" ? [...geometryTypes] : ["LineString", "MultiLineString"];

    const init: { name: string; id: string }[] = [];
    return Object.values(layers).reduce((accumulator, layers) => {
        const initial: { name: string; id: string }[] = [];
        const lays = layers.reduce((acc, l) => {
            if (availableGeometries.includes(l.geometry_type)) {
                acc.push({
                    id: l.id.toString(),
                    name: `${l.database_title}:${l.table_title}`,
                });
            }
            return acc;
        }, initial);
        accumulator = [...accumulator, ...lays];
        return accumulator;
    }, init);
};

const prepareLayersForApi = (values: ToolsFormType): Record<number, { tools: LayerTools[]; ref_tools: Record<RefLayerTools, number[]> }> => {
    return Object.entries(values.layer_tools).reduce((accumulator, [id, config]) => {
        const refTools = {};
        [...arrRefLayerTools].forEach((t) => {
            if (config.ref_tools[t].active && config.ref_tools[t].layers.length !== 0) {
                refTools[t] = config.ref_tools[t].layers.map((l) => Number(l.id));
            }
        });
        accumulator[id] = {
            tools: config.tools.length ? config.tools : null,
            ref_tools: Object.keys(refTools).length ? refTools : null,
        };
        return accumulator;
    }, {});
};

export { getAvailableRefTools, getAvailableTools, getEditableLayers, getRefLayers, prepareLayersForApi };

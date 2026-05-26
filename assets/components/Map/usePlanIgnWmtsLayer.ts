import TileLayer from "ol/layer/Tile";
import WMTS, { optionsFromCapabilities } from "ol/source/WMTS";
import { useMemo } from "react";

import useGeopfWmtsCapabilitiesQuery from "@/hooks/useGeopfWmtsCapabilitiesQuery";
import olDefaults from "../../data/ol-defaults.json";

const layerId = olDefaults.default_background_layer;

export default function usePlanIgnWmtsLayer(): TileLayer | null {
    const { data: capabilities } = useGeopfWmtsCapabilitiesQuery();

    return useMemo(() => {
        if (!capabilities) return null;

        const wmtsOptions = optionsFromCapabilities(capabilities, { layer: layerId });
        if (!wmtsOptions) return null;

        const layersArr = capabilities?.Contents?.Layer;
        const capLayer = Array.isArray(layersArr) ? layersArr.find((l) => l.Identifier === layerId) : undefined;

        return new TileLayer({
            source: new WMTS(wmtsOptions),
            properties: {
                name: capLayer?.Identifier ?? layerId,
                title: capLayer?.Title ?? layerId,
                description: capLayer?.Abstract ?? layerId,
            },
        });
    }, [capabilities]);
}

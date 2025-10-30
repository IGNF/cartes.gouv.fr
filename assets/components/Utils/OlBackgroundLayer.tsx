import TileLayer from "ol/layer/Tile";
import WMTS, { optionsFromCapabilities } from "ol/source/WMTS";
import { useEffect, useRef } from "react";

import { useMapContext } from "@/contexts/MapContext";
import useCapabilities from "@/hooks/useCapabilities";
import olDefaults from "../../data/ol-defaults.json";

const layerId = olDefaults.default_background_layer;

function OlBackgroundLayer() {
    const { data: capabilities } = useCapabilities();

    const layer = useRef<TileLayer | null>(new TileLayer({ properties: { title: null, description: null } }));

    useEffect(() => {
        if (!capabilities || !layer.current) {
            return;
        }

        const wmtsOptions = optionsFromCapabilities(capabilities, { layer: layerId });
        if (!wmtsOptions) {
            return;
        }

        const layersArr = capabilities?.Contents?.Layer;
        const capLayer = Array.isArray(layersArr) ? layersArr.find((l) => l.Identifier === layerId) : undefined;

        layer.current?.setSource(new WMTS(wmtsOptions));
        layer.current?.set("name", capLayer?.Identifier ?? layerId);
        layer.current?.set("title", capLayer?.Title ?? layerId);
        layer.current?.set("description", capLayer?.Abstract ?? layerId);
    }, [capabilities]);

    const { map } = useMapContext();

    useEffect(() => {
        if (!map || !layer.current) return;

        const currentLayer = layer.current;

        // Toujours à la position 0
        const layers = map.getLayers();
        const currentIndex = layers.getArray().indexOf(currentLayer);
        if (currentIndex !== -1) {
            layers.removeAt(currentIndex);
        }
        layers.insertAt(0, currentLayer);

        return () => {
            map.removeLayer(currentLayer);
        };
    }, [map]);

    return null;
}

export default OlBackgroundLayer;

import TileLayer from "ol/layer/Tile";
import WMTS, { optionsFromCapabilities } from "ol/source/WMTS";
import { useEffect, useRef } from "react";

import { useMapContext } from "@/contexts/MapContext";
import useCapabilities from "@/hooks/useCapabilities";
import { cleanLayerSwitcherListeners } from "@/utils/geopf-ol-ext";
import olDefaults from "../../data/ol-defaults.json";

const layerId = olDefaults.default_background_layer;

function OlBackgroundLayer() {
    const { data: capabilities } = useCapabilities();

    const layer = useRef<TileLayer | null>(null);
    if (layer.current === null) {
        layer.current = new TileLayer({ properties: { title: null, description: null } });
    }

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

        // Insère le fond à l'index 0 au mount. Le maintien de cette position dépend du fait que
        // tous les autres layers sont ajoutés via addLayer (append) — si un futur composant
        // utilise insertAt(0, …) ou setZIndex, revisiter.
        cleanLayerSwitcherListeners(currentLayer);
        // zIndex=1 (non nul) : LayerSwitcher.addLayer traite zIndex===0 comme « place en haut »
        // via _lastZIndex++ (LayerSwitcher.js:483-484). L'instance survit au HMR donc
        // _lastZIndex reste accumulé ; sans ce 1, le fond hérite du zIndex maximal après HMR.
        currentLayer.setZIndex(1);
        map.getLayers().insertAt(0, currentLayer);

        return () => {
            map.removeLayer(currentLayer);
            cleanLayerSwitcherListeners(currentLayer);
        };
    }, [map]);

    return null;
}

export default OlBackgroundLayer;

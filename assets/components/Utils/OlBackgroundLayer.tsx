import TileLayer from "ol/layer/Tile";
import WMTS, { optionsFromCapabilities } from "ol/source/WMTS";
import { useEffect, useMemo } from "react";

import useCapabilities from "@/hooks/useCapabilities";
import olDefaults from "../../data/ol-defaults.json";
import OlLayer from "./OlLayer";

const layerId = olDefaults.default_background_layer;

export default function OlBackgroundLayer() {
    const { data: capabilities } = useCapabilities();

    const layer = useMemo(() => new TileLayer({ properties: { title: null, description: null } }), []);

    useEffect(() => {
        if (!capabilities) return;

        const wmtsOptions = optionsFromCapabilities(capabilities, { layer: layerId });
        if (!wmtsOptions) return;

        const layersArr = capabilities?.Contents?.Layer;
        const capLayer = Array.isArray(layersArr) ? layersArr.find((l) => l.Identifier === layerId) : undefined;

        layer.setSource(new WMTS(wmtsOptions));
        layer.set("name", capLayer?.Identifier ?? layerId);
        layer.set("title", capLayer?.Title ?? layerId);
        layer.set("description", capLayer?.Abstract ?? layerId);
    }, [capabilities, layer]);

    // zIndex=1 transmis à OlLayer : contournement #460. cleanLayerSwitcherListeners reset le
    // zIndex à 0 à chaque attach ; sans ce zIndex>0 réappliqué juste avant addLayer,
    // LayerSwitcher bumperait le fond via _lastZIndex++ et le placerait au-dessus au HMR.
    // Les couches utilisateurs sortent à zIndex 2, 3, 4… → fond toujours en dessous.
    return <OlLayer layer={layer} zIndex={1} />;
}

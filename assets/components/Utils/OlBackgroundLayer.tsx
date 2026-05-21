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

    // zIndex=1 + index=0 transmis à OlLayer : double contournement #460.
    // - zIndex=1 (réappliqué après cleanLayerSwitcherListeners qui reset à 0) évite que
    //   LS.addLayer prenne la branche _lastZIndex++ et bumpe le fond au-dessus.
    // - index=0 garantit la position en tête de Collection, tie-breaker indispensable car
    //   LS.removeLayer décale les couches utilisateurs vers le bas (zIndex=1 chez la 1re),
    //   créant systématiquement une égalité avec le fond au remount HMR.
    return <OlLayer layer={layer} index={0} zIndex={1} />;
}

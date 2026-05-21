import BaseLayer from "ol/layer/Base";
import { useEffect } from "react";

import type { CartesStyle, GeostylerStyles } from "@/@types/app";
import { useMapContext } from "@/contexts/MapContext";
import StyleHelper from "@/modules/Style/StyleHelper";
import { cleanLayerSwitcherListeners } from "@/utils/geopf-ol-ext";

type OlLayerProps = {
    layer: BaseLayer;
    style?: CartesStyle | GeostylerStyles;
    /**
     * Position d'insertion dans `map.getLayers()`. Indispensable pour le fond de carte :
     * `LayerSwitcher.removeLayer` réassigne le `zIndex` des couches restantes vers le bas
     * (cf. issue #460), ce qui crée systématiquement une égalité de zIndex avec le nouveau
     * fond au remount HMR. La position dans la `Collection` est le seul tie-breaker.
     */
    index?: number;
    /**
     * `zIndex` appliqué après `cleanLayerSwitcherListeners` (qui reset à 0) et avant l'attach.
     * Force `LayerSwitcher.addLayer` à passer par `_updateLayersOrder()` plutôt que par la
     * branche `_lastZIndex++` qui bumperait la couche au-dessus de toutes les autres.
     */
    zIndex?: number;
};

/**
 * Attache de manière déclarative une couche OpenLayers à la carte courante.
 * - Ajoute la couche fournie au mount (quand la carte est disponible) et retire exactement cette couche en unMount.
 * - Applique le style fourni au mount et à chaque changement de celui-ci.
 */
export default function OlLayer({ layer, style, index, zIndex }: OlLayerProps) {
    const { map } = useMapContext();

    useEffect(() => {
        if (!map) return;

        cleanLayerSwitcherListeners(layer);
        if (typeof zIndex === "number") {
            layer.setZIndex(zIndex);
        }
        if (typeof index === "number") {
            map.getLayers().insertAt(index, layer);
        } else {
            map.addLayer(layer);
        }

        return () => {
            map.removeLayer(layer);
            cleanLayerSwitcherListeners(layer);
        };
    }, [map, layer, index, zIndex]);

    // Application du style
    useEffect(() => {
        if (!style) return;
        StyleHelper.applyStyle(layer, style);
    }, [layer, style]);

    return null;
}

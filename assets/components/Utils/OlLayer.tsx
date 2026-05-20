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
     * `zIndex` appliqué après le nettoyage des listeners orphelins (cf. issue #460) et avant
     * `addLayer`. Indispensable pour le fond de carte : sans valeur > 0 forcée à ce moment,
     * LayerSwitcher.addLayer voit `zIndex === 0` et bump via `_lastZIndex++`, plaçant la
     * couche au-dessus de toutes les autres au HMR.
     */
    zIndex?: number;
};

/**
 * Attache de manière déclarative une couche OpenLayers à la carte courante.
 * - Ajoute la couche fournie au mount (quand la carte est disponible) et retire exactement cette couche en unMount.
 * - Applique le style fourni au mount et à chaque changement de celui-ci.
 */
export default function OlLayer({ layer, style, zIndex }: OlLayerProps) {
    const { map } = useMapContext();

    useEffect(() => {
        if (!map) return;

        cleanLayerSwitcherListeners(layer);
        if (typeof zIndex === "number") {
            layer.setZIndex(zIndex);
        }
        map.addLayer(layer);

        return () => {
            map.removeLayer(layer);
            cleanLayerSwitcherListeners(layer);
        };
    }, [map, layer, zIndex]);

    // Application du style
    useEffect(() => {
        if (!style) return;
        StyleHelper.applyStyle(layer, style);
    }, [layer, style]);

    return null;
}

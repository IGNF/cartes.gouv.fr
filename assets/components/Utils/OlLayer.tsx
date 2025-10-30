import BaseLayer from "ol/layer/Base";
import { useEffect } from "react";

import type { CartesStyle, GeostylerStyles } from "@/@types/app";
import { useMapContext } from "@/contexts/MapContext";
import StyleHelper from "@/modules/Style/StyleHelper";

type OlLayerProps = {
    layer: BaseLayer;
    style?: CartesStyle | GeostylerStyles;
};

/**
 * Attache de manière déclarative une couche OpenLayers à la carte courante.
 * - Ajoute la couche fournie au mount (quand la carte est disponible) et retire exactement cette couche en unMount.
 * - Applique le style fourni au mount et à chaque changement de celui-ci.
 */
export default function OlLayer({ layer, style }: OlLayerProps) {
    const { map } = useMapContext();

    useEffect(() => {
        if (!map) return;

        map.addLayer(layer);

        return () => {
            map.removeLayer(layer);
        };
    }, [map, layer]);

    // Application du style
    useEffect(() => {
        if (!style) return;
        StyleHelper.applyStyle(layer, style);
    }, [layer, style]);

    return null;
}

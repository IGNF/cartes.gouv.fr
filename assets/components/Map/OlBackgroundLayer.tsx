import TileLayer from "ol/layer/Tile";
import WMTS, { optionsFromCapabilities } from "ol/source/WMTS";
import { useMemo } from "react";

import useCapabilities from "@/hooks/useCapabilities";
import olDefaults from "../../data/ol-defaults.json";
import OlLayer from "./OlLayer";

const layerId = olDefaults.default_background_layer;

export default function OlBackgroundLayer() {
    const { data: capabilities } = useCapabilities();

    // Couche construite en une fois avec toutes ses propriétés finales.
    // Tant que capabilities n'est pas disponible, on ne rend rien : on évite ainsi d'attacher
    // au LayerSwitcher une couche avec `title=null` qui ferait afficher le `gpLayerId` (0)
    // comme libellé, jusqu'à un éventuel `propertychange` ultérieur — chemin qui ne se déclenche
    // pas de façon fiable selon le scénario de HMR sur ServiceView (cf. plan).
    const layer = useMemo(() => {
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

    if (!layer) return null;

    // zIndex=1 + index=0 transmis à OlLayer : double contournement #460.
    // - zIndex=1 (réappliqué après cleanLayerSwitcherListeners qui reset à 0) évite que
    //   LS.addLayer prenne la branche _lastZIndex++ et bumpe le fond au-dessus.
    // - index=0 garantit la position en tête de Collection, tie-breaker indispensable car
    //   LS.removeLayer décale les couches utilisateurs vers le bas (zIndex=1 chez la 1re),
    //   créant systématiquement une égalité avec le fond au remount HMR.
    return <OlLayer layer={layer} index={0} zIndex={1} />;
}

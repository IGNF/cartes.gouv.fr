import TileLayer from "ol/layer/Tile";
import Map from "ol/Map";
import WMTS, { optionsFromCapabilities } from "ol/source/WMTS";
import { useEffect, useRef } from "react";

import type { Capabilities } from "../@types/ol";
export function useBackgroundWmts(map: Map | undefined, capabilities: Capabilities | undefined, layerId: string | undefined): void {
    const bkLayerRef = useRef<TileLayer>(new TileLayer({ properties: { title: null, description: null } }));

    // S'assurer que le fond de carte est bien présent dans la carte une fois
    useEffect(() => {
        if (!map) return;
        const layers = map.getLayers();
        if (!layers.getArray().includes(bkLayerRef.current)) {
            map.addLayer(bkLayerRef.current);
        }
    }, [map]);

    // Configurer la source à partir des capabilities
    useEffect(() => {
        if (!capabilities || !layerId) return;

        const wmtsOptions = optionsFromCapabilities(capabilities, {
            layer: layerId,
        });

        if (!wmtsOptions) return;

        const layersArr = capabilities?.Contents?.Layer;
        const capLayer = Array.isArray(layersArr) ? layersArr.find((l) => l.Identifier === layerId) : undefined;

        bkLayerRef.current.setSource(new WMTS(wmtsOptions));
        bkLayerRef.current.set("name", capLayer?.Identifier ?? layerId);
        bkLayerRef.current.set("title", capLayer?.Title ?? layerId);
        bkLayerRef.current.set("description", capLayer?.Abstract ?? layerId);
        console.log(capLayer);
        console.log(bkLayerRef.current);
    }, [capabilities, layerId]);
}

export default useBackgroundWmts;

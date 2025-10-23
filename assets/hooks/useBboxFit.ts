import { useEffect } from "react";
import Map from "ol/Map";
import { createOrUpdate } from "ol/extent";
import { transformExtent } from "ol/proj";
import type { BoundingBox } from "../@types/entrepot";

/**
 * Fit la carte à l'étendue fournie (en EPSG:4326 par défaut).
 */
export function useBboxFit(map: Map | undefined, bbox?: BoundingBox, sourceCrs: string = "EPSG:4326", targetCrs?: string) {
    useEffect(() => {
        if (!map || !bbox) return;

        const view = map.getView();
        const proj = targetCrs ?? view.getProjection()?.getCode() ?? "EPSG:3857";

        let extent = createOrUpdate(bbox.west, bbox.south, bbox.east, bbox.north);
        extent = transformExtent(extent, sourceCrs, proj);

        if (extent) {
            view.fit(extent);
        }
    }, [map, bbox, sourceCrs, targetCrs]);
}

export default useBboxFit;

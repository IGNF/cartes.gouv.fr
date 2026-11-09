import GeoJSON from "ol/format/GeoJSON";

import { BoundingBox } from "@/@types/entrepot";

export const getProjectionCode = (epsg?: string) => {
    if (!epsg) return null;
    const parts = epsg.split(":");
    if (parts.length === 2) {
        return parts[1];
    }
    return null;
};

export const bboxToWkt = (bbox: BoundingBox) => {
    const str = "POLYGON((west north,east north,east south,west south,west north))";

    return str.replace(/[a-z]+/g, (s) => String(bbox[s as keyof BoundingBox]));
};

/** Bbox [minLon, minLat, maxLon, maxLat] d’une géométrie GeoJSON sérialisée (EPSG:4326), undefined si illisible */
export const bboxFromGeoJsonString = (geometry: string): number[] | undefined => {
    try {
        const parsed: unknown = JSON.parse(geometry);
        return new GeoJSON().readGeometry(parsed)?.getExtent();
    } catch {
        return undefined;
    }
};

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

    return str.replace(/[a-z]+/g, function (s) {
        return bbox[s];
    });
};

/**
 * Dérive une bbox [minLon, minLat, maxLon, maxLat] depuis une géométrie GeoJSON
 * sérialisée en chaîne (EPSG:4326). Renvoie undefined si le parse échoue.
 */
export const bboxFromGeoJsonString = (geometry: string): number[] | undefined => {
    try {
        const parsed: unknown = JSON.parse(geometry);
        const format = new GeoJSON();
        const geom = format.readGeometry(parsed);
        return geom.getExtent();
    } catch {
        return undefined;
    }
};

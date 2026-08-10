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

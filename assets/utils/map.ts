import { BoundingBox } from "@/@types/entrepot";

export const bboxToWkt = (bbox: BoundingBox) => {
    const str = "POLYGON((west north,east north,east south,west south,west north))";

    return str.replace(/[a-z]+/g, (s) => String(bbox[s as keyof BoundingBox]));
};

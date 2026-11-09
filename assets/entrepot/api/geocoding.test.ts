import { describe, expect, it } from "vitest";

import { bboxFromGeoJsonString } from "./geocoding";

describe("bboxFromGeoJsonString", () => {
    it("renvoie l’emprise d’un polygone", () => {
        const polygon = JSON.stringify({
            type: "Polygon",
            coordinates: [
                [
                    [4.7, 45.7],
                    [4.9, 45.7],
                    [4.9, 45.8],
                    [4.7, 45.7],
                ],
            ],
        });

        expect(bboxFromGeoJsonString(polygon)).toEqual([4.7, 45.7, 4.9, 45.8]);
    });

    it("renvoie undefined pour un JSON illisible ou une géométrie vide", () => {
        expect(bboxFromGeoJsonString("{")).toBeUndefined();
        expect(bboxFromGeoJsonString(JSON.stringify({ type: "Polygon", coordinates: [] }))).toBeUndefined();
    });
});

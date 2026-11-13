import { describe, expect, it } from "vitest";

import { bboxFromGeoJsonString, zoneCode } from "./geocoding";

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

describe("zoneCode", () => {
    it("préfixe les départements par D sur trois chiffres et les régions par R", () => {
        expect(zoneCode("département", "01")).toBe("D001");
        expect(zoneCode("département", "973")).toBe("D973");
        expect(zoneCode("département", "2A")).toBe("D02A");
        expect(zoneCode("région", "11")).toBe("R11");
        expect(zoneCode("région", "03")).toBe("R03");
    });

    it("garde le code INSEE des communes et n’en donne pas aux EPCI", () => {
        expect(zoneCode("commune", "18002")).toBe("18002");
        expect(zoneCode("epci", undefined)).toBeUndefined();
        expect(zoneCode("epci", "123")).toBeUndefined();
    });
});

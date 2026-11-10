import { describe, expect, it } from "vitest";

import { mapIgnfToEpsg } from "./upload";

describe("mapIgnfToEpsg", () => {
    it("convertit un code IGNF connu", () => expect(mapIgnfToEpsg("IGNF:LAMB93")).toBe("EPSG:2154"));
    it("garde un code inconnu", () => expect(mapIgnfToEpsg("EPSG:4326")).toBe("EPSG:4326"));
    it("rejette une valeur vide ou non textuelle", () => {
        expect(mapIgnfToEpsg("")).toBeUndefined();
        expect(mapIgnfToEpsg("  ")).toBeUndefined();
        expect(mapIgnfToEpsg(42)).toBeUndefined();
    });
});

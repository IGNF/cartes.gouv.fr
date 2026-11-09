import { describe, expect, it } from "vitest";

import { integrationProgressHasFailure, mapIgnfToEpsg, parseIntegrationProgress } from "./upload";

describe("mapIgnfToEpsg", () => {
    it("convertit un code IGNF connu", () => expect(mapIgnfToEpsg("IGNF:LAMB93")).toBe("EPSG:2154"));
    it("garde un code inconnu", () => expect(mapIgnfToEpsg("EPSG:4326")).toBe("EPSG:4326"));
    it("rejette une valeur vide ou non textuelle", () => {
        expect(mapIgnfToEpsg("")).toBeUndefined();
        expect(mapIgnfToEpsg("  ")).toBeUndefined();
        expect(mapIgnfToEpsg(42)).toBeUndefined();
    });
});

describe("parseIntegrationProgress", () => {
    it("lit un objet JSON", () => expect(parseIntegrationProgress('{"send_files":"successful"}')).toEqual({ send_files: "successful" }));
    it("renvoie null pour un JSON invalide, un tableau ou une valeur absente", () => {
        expect(parseIntegrationProgress("{")).toBeNull();
        expect(parseIntegrationProgress("[]")).toBeNull();
        expect(parseIntegrationProgress(undefined)).toBeNull();
    });
    it("détecte une étape en échec", () => {
        expect(integrationProgressHasFailure('{"a":"successful","b":"failed"}')).toBe(true);
        expect(integrationProgressHasFailure('{"a":"successful"}')).toBe(false);
        expect(integrationProgressHasFailure(undefined)).toBe(false);
    });
});

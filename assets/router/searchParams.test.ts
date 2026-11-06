import { describe, expect, it } from "vitest";

import { enumParam, integerParam, positiveIntegerParam, requiredStringParam, stringParam } from "./searchParams";

describe("paramètres de recherche", () => {
    it("lit une chaîne, y compris une valeur que le parseur JSON a convertie", () => {
        expect(stringParam("abc")).toBe("abc");
        expect(stringParam(123)).toBe("123");
        expect(stringParam({ a: 1 })).toBeUndefined();
        expect(stringParam(undefined)).toBeUndefined();
    });

    it("rejette un paramètre requis absent ou vide", () => {
        expect(requiredStringParam("v", "vectorDbId")).toBe("v");
        expect(() => requiredStringParam(undefined, "vectorDbId")).toThrow("vectorDbId");
        expect(() => requiredStringParam("", "vectorDbId")).toThrow("vectorDbId");
    });

    it("lit un entier depuis un nombre ou une chaîne, en tronquant", () => {
        expect(integerParam(2)).toBe(2);
        expect(integerParam(1.5)).toBe(1);
        expect(integerParam("3")).toBe(3);
        expect(integerParam(0)).toBe(0);
        expect(integerParam("abc")).toBeUndefined();
        expect(integerParam(Infinity)).toBeUndefined();
        expect(integerParam(undefined)).toBeUndefined();
    });

    it("ignore une page ou une limite inférieure à 1", () => {
        expect(positiveIntegerParam(0)).toBeUndefined();
        expect(positiveIntegerParam(-2)).toBeUndefined();
        expect(positiveIntegerParam(0.5)).toBeUndefined();
        expect(positiveIntegerParam("4")).toBe(4);
    });

    it("borne une valeur à une liste autorisée", () => {
        expect(enumParam("s3", ["postgresql", "s3"] as const)).toBe("s3");
        expect(enumParam("ftp", ["postgresql", "s3"] as const)).toBeUndefined();
        expect(enumParam(-1, [1, -1])).toBe(-1);
        expect(enumParam("-1", [1, -1])).toBe(-1);
        expect(enumParam(2, [1, -1])).toBeUndefined();
    });
});

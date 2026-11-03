// @vitest-environment jsdom
import { describe, expect, it } from "vitest";

import { routeNumberParam, routePositiveIntegerParam, routeStringParam } from "./router";

describe("paramètres de route", () => {
    it("lit une chaîne seulement si c’en est une", () => {
        expect(routeStringParam({ search: "abc" }, "search")).toBe("abc");
        expect(routeStringParam({ search: 3 }, "search")).toBeUndefined();
        expect(routeStringParam(undefined, "search")).toBeUndefined();
    });

    it("lit un entier depuis un nombre ou une chaîne, en tronquant", () => {
        expect(routeNumberParam({ page: 2 }, "page")).toBe(2);
        expect(routeNumberParam({ page: 1.5 }, "page")).toBe(1);
        expect(routeNumberParam({ page: "3" }, "page")).toBe(3);
        expect(routeNumberParam({ filter: 0 }, "filter")).toBe(0);
        expect(routeNumberParam({ page: "abc" }, "page")).toBeUndefined();
        expect(routeNumberParam({ page: Infinity }, "page")).toBeUndefined();
        expect(routeNumberParam({}, "page")).toBeUndefined();
    });

    it("ignore une page ou une limite inférieure à 1", () => {
        expect(routePositiveIntegerParam({ limit: 0 }, "limit")).toBeUndefined();
        expect(routePositiveIntegerParam({ page: -2 }, "page")).toBeUndefined();
        expect(routePositiveIntegerParam({ page: 0.5 }, "page")).toBeUndefined();
        expect(routePositiveIntegerParam({ page: "4" }, "page")).toBe(4);
    });
});

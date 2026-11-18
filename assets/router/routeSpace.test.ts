import { describe, expect, it } from "vitest";

import { routeSpace } from "./routeSpace";

describe("routeSpace", () => {
    it("returns the space of the deepest match declaring one", () => {
        expect(routeSpace([{ staticData: {} }, { staticData: { space: "publish" } }, { staticData: { space: "contribute" } }, { staticData: {} }])).toBe(
            "contribute"
        );
    });

    it("returns undefined when no match declares a space", () => {
        expect(routeSpace([{ staticData: {} }, { staticData: { matomoLabel: "Mon compte" } }])).toBeUndefined();
        expect(routeSpace([])).toBeUndefined();
    });
});

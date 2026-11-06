import { describe, expect, it } from "vitest";

// fichiers de routes feuilles : tout sauf les layouts (route.tsx) et la racine
const leaves = import.meta.glob<string>(["../routes/**/*.tsx", "!**/route.tsx", "!**/__root.tsx"], { query: "?raw", import: "default", eager: true });

describe("libellés Matomo", () => {
    it("trouve les feuilles", () => {
        expect(Object.keys(leaves).length).toBeGreaterThan(40);
    });

    it.each(Object.entries(leaves))("%s déclare un matomoLabel", (_file, source) => {
        expect(source).toMatch(/matomoLabel: "[^"]+"/);
    });
});

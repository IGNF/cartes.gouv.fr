import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const eulerianStart = vi.fn(() => Promise.resolve({ enable: vi.fn(), disable: vi.fn() }));
vi.mock("@codegouvfr/react-dsfr/eulerianAnalytics", () => ({ startEulerianAnalytics: eulerianStart }));

function stubBrowser({ cookie = "", storage = {} as Record<string, string> } = {}) {
    const store = new Map(Object.entries(storage));
    vi.stubGlobal("localStorage", {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => store.set(k, v),
        removeItem: (k: string) => store.delete(k),
    });
    vi.stubGlobal("window", { _paq: undefined, location: { href: "http://localhost/" } });
    vi.stubGlobal("document", {
        cookie,
        createElement: () => ({}),
        getElementsByTagName: () => [{ parentNode: { insertBefore: () => undefined } }],
        getElementById: () => ({ dataset: { appEnv: "prod" } }),
        referrer: "",
    });
    return store;
}

describe("analyticsInit", () => {
    beforeEach(() => vi.resetModules());
    afterEach(() => {
        vi.unstubAllGlobals();
        eulerianStart.mockClear();
    });

    it("starts Matomo and Eulerian, tagged production, and drops the legacy consent key", async () => {
        const store = stubBrowser({ storage: { "@codegouvfr/react-dsfr finalityConsent eulerianAnalytics": "{}" } });
        const { analyticsInit } = await import("./analytics");
        await analyticsInit();

        expect(window._paq).toEqual([
            ["setTrackerUrl", "https://matomo.ign.fr/matomo.php"],
            ["setSiteId", "11"],
            ["setDoNotTrack", true],
            ["enableLinkTracking"],
        ]);
        // oxlint-disable-next-line typescript/no-unsafe-assignment -- expect.objectContaining renvoie any par conception (vitest)
        expect(eulerianStart).toHaveBeenCalledWith(expect.objectContaining({ site: expect.objectContaining({ environment: "production" }) }));
        expect(store.has("@codegouvfr/react-dsfr finalityConsent eulerianAnalytics")).toBe(false);
    });

    it("honours the Matomo opt-out cookie and the Eulerian opt-out key", async () => {
        stubBrowser({ cookie: "_pk_id=x; mtm_consent_removed=1", storage: { _EA_: "1" } });
        const { analyticsInit } = await import("./analytics");
        await analyticsInit();

        expect(window._paq).toBeUndefined();
        expect(eulerianStart).not.toHaveBeenCalled();
    });
});

describe("matomoPageTitle", () => {
    beforeEach(() => {
        vi.resetModules();
        stubBrowser();
    });
    afterEach(() => vi.unstubAllGlobals());

    const match = (routeId: string, matomoLabel?: string) => ({ routeId, staticData: { matomoLabel } });

    it("prefixes by space and uses the deepest label", async () => {
        const { matomoPageTitle } = await import("./analytics");

        expect(matomoPageTitle([match("__root__"), match("/_private"), match("/_private/tableau-de-bord/", "Tableau de bord")])).toBe(
            "[Publier] Tableau de bord"
        );
        expect(
            matomoPageTitle([
                match("/_private"),
                match("/_private/tableau-de-bord/entrepots/$datastoreId"),
                match("/_private/tableau-de-bord/entrepots/$datastoreId/service/wfs/ajout", "Publier un service WFS"),
            ])
        ).toBe("[Publier] Publier un service WFS");
        expect(
            matomoPageTitle([match("/_private"), match("/_private/espace-collaboratif"), match("/_private/espace-collaboratif/", "Liste des guichets")])
        ).toBe("[Contribuer] Liste des guichets");
    });

    it("falls back to the not found label without a leaf", async () => {
        const { matomoPageTitle } = await import("./analytics");

        expect(matomoPageTitle([match("__root__")])).toBe("[Publier] Page introuvable");
        expect(matomoPageTitle([])).toBe("[Publier] Page introuvable");
    });
});

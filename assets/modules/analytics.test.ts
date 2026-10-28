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

    it("prefixes by route group and uses the page labels", async () => {
        const { matomoPageTitle } = await import("./analytics");
        const { routes } = await import("@/router/router");

        expect(matomoPageTitle(routes.dashboard())).toBe("[Publier] Tableau de bord");
        expect(matomoPageTitle(routes.datastore_wfs_service_new({ datastoreId: "d", vectorDbId: "v", datasheetName: "n" }))).toBe(
            "[Publier] Publier un service WFS"
        );
        expect(matomoPageTitle(routes.espaceco_community_list())).toBe("[Contribuer] Liste des guichets");
        expect(matomoPageTitle({ name: false, params: {} } as never)).toBe("[Publier] Page introuvable");
    });
});

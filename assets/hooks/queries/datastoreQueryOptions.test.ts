import { describe, expect, it, vi } from "vitest";

import api from "@/entrepot/api";
import { datastoreQueryOptions } from "./datastoreQueryOptions";

// le vrai module api lit le DOM au chargement (env.ts)
vi.mock("@/entrepot/api", () => ({ default: { datastore: { get: vi.fn() } } }));

describe("datastoreQueryOptions", () => {
    it("est désactivée et rejette sans appel réseau quand l’id est inconnu", async () => {
        const options = datastoreQueryOptions(undefined);
        expect(options.enabled).toBe(false);
        expect(options.queryKey.at(-1)).toBe("");

        const queryFn = options.queryFn as (context: { signal: AbortSignal }) => Promise<unknown>;
        await expect(queryFn({ signal: new AbortController().signal })).rejects.toThrow("datastoreId manquant");
        expect(api.datastore.get).not.toHaveBeenCalled();
    });

    it("est activée avec la clé préfixée quand l’id est connu", () => {
        const options = datastoreQueryOptions("d1");
        expect(options.enabled).toBe(true);
        expect(options.queryKey).toEqual(["entrepot", "datastore", "d1"]);
    });
});

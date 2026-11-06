import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import RQKeys from "./entrepot/RQKeys";

const apiError = (status: number) => ({ status, title: "erreur" });

// le délai de 30 s est un état du module : un module neuf par test
async function setup() {
    vi.resetModules();
    const { queryClient } = await import("./queryClient");
    const invalidate = vi.spyOn(queryClient, "invalidateQueries").mockResolvedValue();
    const fail = (queryKey: readonly unknown[], status: number) =>
        queryClient.query({ queryKey, queryFn: () => Promise.reject(apiError(status)), retry: false }).catch(() => undefined);
    return { invalidate, fail };
}

describe("revalidation de user_me sur erreur d’accès", () => {
    beforeEach(() => vi.useFakeTimers({ toFake: ["Date"] }));
    afterEach(() => vi.useRealTimers());

    it("revalide une fois par fenêtre de 30 s sur 403 ou 404", async () => {
        const { invalidate, fail } = await setup();

        await fail(["entrepot", "a"], 404);
        await fail(["entrepot", "b"], 403);
        expect(invalidate).toHaveBeenCalledTimes(1);
        expect(invalidate).toHaveBeenCalledWith({ queryKey: RQKeys.user_me(), exact: true });

        vi.setSystemTime(Date.now() + 31_000);
        await fail(["entrepot", "c"], 404);
        expect(invalidate).toHaveBeenCalledTimes(2);
    });

    it("ignore l’échec de user_me lui-même et les autres statuts", async () => {
        const { invalidate, fail } = await setup();

        await fail(RQKeys.user_me(), 404);
        await fail(["entrepot", "d"], 401);
        await fail(["entrepot", "e"], 500);
        expect(invalidate).not.toHaveBeenCalled();
    });
});

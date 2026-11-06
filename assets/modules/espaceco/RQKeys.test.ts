import { describe, expect, it } from "vitest";

import RQKeys from "./RQKeys";

// arguments tableaux pour les clés qui font join/map dessus
const arrayArgs: Record<string, unknown[]> = {
    databases: [["f1"]],
    searchDatabases: ["field", "search", ["f1"]],
    permissionsOnDB: [1, [2]],
};

describe("RQKeys espaceco", () => {
    it.each(Object.entries(RQKeys))("%s commence par le préfixe espaceco", (name, builder) => {
        const key = (builder as (...args: unknown[]) => string[])(...(arrayArgs[name] ?? [1, 2]));
        expect(key[0]).toBe("espaceco");
        expect(key.length).toBeGreaterThanOrEqual(2);
    });

    it("getMe ne double pas le préfixe", () => {
        expect(RQKeys.getMe()).toEqual(["espaceco", "users", "me"]);
    });
});

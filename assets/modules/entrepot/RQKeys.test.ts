import { describe, expect, it } from "vitest";

import RQKeys from "./RQKeys";

describe("RQKeys entrepot", () => {
    it.each(Object.entries(RQKeys))("%s commence par le préfixe entrepot", (_name, builder) => {
        const key = (builder as (...args: string[]) => string[])("id1", "id2", "id3");
        expect(key[0]).toBe("entrepot");
        expect(key.length).toBeGreaterThanOrEqual(2);
    });

    it("user_me ne double pas le préfixe", () => {
        expect(RQKeys.user_me()).toEqual(["entrepot", "user", "me"]);
    });
});

import { beforeEach, describe, expect, it } from "vitest";

import { CartesUser } from "@/@types/app";
import { useSessionStore } from "./SessionStore";

const user = { _id: "user-1", email: "user@example.test" } as CartesUser;

describe("SessionStore", () => {
    beforeEach(() => {
        useSessionStore.setState({ status: "anonymous" });
    });

    it("passe en actif sur une charge utilisateur, en anonyme sur une charge nulle", () => {
        useSessionStore.getState().applyUser(user);
        expect(useSessionStore.getState().status).toBe("active");

        useSessionStore.getState().applyUser(null);
        expect(useSessionStore.getState().status).toBe("anonymous");
    });

    it("marque la session expirée sur un 401, sauf pour un visiteur anonyme", () => {
        useSessionStore.getState().markExpired();
        expect(useSessionStore.getState().status).toBe("anonymous");

        useSessionStore.getState().applyUser(user);
        useSessionStore.getState().markExpired();
        expect(useSessionStore.getState().status).toBe("expired");
    });

    it("se remet en actif sur une nouvelle charge utilisateur après un 401", () => {
        useSessionStore.getState().applyUser(user);
        useSessionStore.getState().markExpired();

        useSessionStore.getState().applyUser(user);
        expect(useSessionStore.getState().status).toBe("active");
    });
});

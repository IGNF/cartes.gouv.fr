import { beforeEach, describe, expect, it } from "vitest";

import { computeStatus, useSessionStore } from "./SessionStore";

const NOW = 1_700_000_000_000;
const TWELVE_HOURS = 12 * 60 * 60 * 1000;
const expiresAtSeconds = (NOW + TWELVE_HOURS) / 1000;

describe("SessionStore", () => {
    beforeEach(() => {
        useSessionStore.setState({ status: "anonymous", expiresAt: null });
    });

    it("calcule le statut depuis l’expiration", () => {
        const expiresAt = NOW + TWELVE_HOURS;
        expect(computeStatus(null, NOW)).toBe("anonymous");
        expect(computeStatus(expiresAt, NOW)).toBe("active");
        expect(computeStatus(expiresAt, expiresAt - 1)).toBe("active");
        expect(computeStatus(expiresAt, expiresAt)).toBe("expired");
    });

    it("passe en actif sur une charge utilisateur, en anonyme sur une charge nulle", () => {
        useSessionStore.getState().applySession(expiresAtSeconds, NOW);
        expect(useSessionStore.getState()).toMatchObject({ status: "active", expiresAt: NOW + TWELVE_HOURS });

        useSessionStore.getState().applySession(null, NOW);
        expect(useSessionStore.getState()).toMatchObject({ status: "anonymous", expiresAt: null });
    });

    it("traite une expiration non numérique comme un visiteur anonyme", () => {
        useSessionStore.getState().applySession(Number.NaN, NOW);
        expect(useSessionStore.getState().status).toBe("anonymous");
    });

    it("avance avec l’horloge sans jamais reculer", () => {
        const { applySession, tick } = useSessionStore.getState();
        applySession(expiresAtSeconds, NOW);

        tick(NOW + TWELVE_HOURS - 1);
        expect(useSessionStore.getState().status).toBe("active");

        tick(NOW + TWELVE_HOURS);
        expect(useSessionStore.getState().status).toBe("expired");

        tick(NOW);
        expect(useSessionStore.getState().status).toBe("expired");
    });

    it("marque la session expirée sur un 401, sauf pour un visiteur anonyme", () => {
        useSessionStore.getState().markExpired();
        expect(useSessionStore.getState().status).toBe("anonymous");

        useSessionStore.getState().applySession(expiresAtSeconds, NOW);
        useSessionStore.getState().markExpired();
        expect(useSessionStore.getState().status).toBe("expired");

        // l’horloge ne réactive pas une session que le serveur a refusée
        useSessionStore.getState().tick(NOW);
        expect(useSessionStore.getState().status).toBe("expired");
    });

    it("se remet en actif sur une nouvelle charge utilisateur après un 401", () => {
        useSessionStore.getState().applySession(expiresAtSeconds, NOW);
        useSessionStore.getState().markExpired();

        useSessionStore.getState().applySession(expiresAtSeconds, NOW);
        expect(useSessionStore.getState().status).toBe("active");
    });
});

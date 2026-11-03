// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CartesUser } from "@/@types/app";
import RQKeys from "@/modules/entrepot/RQKeys";
import { queryClient } from "@/modules/queryClient";
import SymfonyRouting from "@/modules/Routing";
import { useSessionStore } from "@/stores/SessionStore";
import { LOGIN_POPUP_FEATURES, LOGIN_POPUP_NAME, applyUser, reconnect, startSessionClock, stopSessionClock } from "./session";

const NOW = new Date("2026-11-03T10:00:00Z").getTime();
const HOUR = 60 * 60 * 1000;

function user(expiresAtMs: number): CartesUser {
    return { _id: "user-1", email: "user@example.test", user_name: "user", roles: ["ROLE_USER"], session_expires_at: expiresAtMs / 1000 } as CartesUser;
}

function jsonResponse(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), { status, headers: { "Content-Type": status < 400 ? "application/json" : "application/problem+json" } });
}

const focus = vi.fn();

function fakePopup() {
    return { closed: false, focus } as unknown as Window;
}

describe("session", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(NOW);
        // les URL du front sont relatives, Request (Node) exige une URL absolue
        SymfonyRouting.setBaseUrl("http://localhost");
        queryClient.clear();
        useSessionStore.setState({ status: "anonymous", expiresAt: null });
    });

    afterEach(() => {
        focus.mockReset();
        stopSessionClock();
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it("passe en expirée à l’heure portée par la charge amorcée dans le cache", () => {
        queryClient.setQueryData(RQKeys.user_me(), user(NOW + 12 * HOUR));
        startSessionClock();
        expect(useSessionStore.getState().status).toBe("active");

        vi.advanceTimersByTime(12 * HOUR - 1);
        expect(useSessionStore.getState().status).toBe("active");

        vi.advanceTimersByTime(1001);
        expect(useSessionStore.getState().status).toBe("expired");
    });

    it("recalcule tout de suite au retour sur la page après un saut d’horloge", () => {
        startSessionClock();
        applyUser(user(NOW + 12 * HOUR));

        // les minuteries n’ont pas tourné (onglet en arrière-plan), seule l’heure a changé
        vi.setSystemTime(NOW + 12 * HOUR + 1);
        Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true });
        document.dispatchEvent(new Event("visibilitychange"));

        expect(useSessionStore.getState().status).toBe("expired");
    });

    it("reste anonyme sans charge utilisateur et n’appelle jamais l’API", () => {
        const fetchMock = vi.fn();
        vi.stubGlobal("fetch", fetchMock);
        queryClient.setQueryData(RQKeys.user_me(), null);
        startSessionClock();

        vi.advanceTimersByTime(24 * HOUR);
        window.dispatchEvent(new Event("focus"));

        expect(useSessionStore.getState().status).toBe("anonymous");
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("ouvre la connexion dans une popup nommée avec le drapeau popup", () => {
        const popup = fakePopup();
        const open = vi.spyOn(window, "open").mockReturnValue(popup);

        reconnect();

        expect(open).toHaveBeenCalledWith("http://localhost/login?popup=1", LOGIN_POPUP_NAME, LOGIN_POPUP_FEATURES);

        // une seconde demande ramène la popup déjà ouverte au premier plan
        reconnect();
        expect(open).toHaveBeenCalledTimes(1);
        expect(focus).toHaveBeenCalledTimes(1);
    });

    it("se rabat sur une navigation vers le login quand la popup est bloquée", () => {
        vi.spyOn(window, "open").mockReturnValue(null);
        const assign = vi.fn();
        vi.stubGlobal("location", { href: window.location.href, assign });

        reconnect();

        expect(assign).toHaveBeenCalledWith("http://localhost/login");
    });

    it("relit l’utilisateur à la fermeture de la popup et réactive la session, cache écrit avant invalidation", async () => {
        startSessionClock();
        applyUser(user(NOW - 1));
        expect(useSessionStore.getState().status).toBe("expired");

        const reconnected = user(NOW + 12 * HOUR);
        vi.stubGlobal(
            "fetch",
            vi.fn(() => Promise.resolve(jsonResponse(reconnected)))
        );
        const setQueryData = vi.spyOn(queryClient, "setQueryData");
        const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
        const popup = fakePopup();
        vi.spyOn(window, "open").mockReturnValue(popup);

        reconnect();
        await vi.advanceTimersByTimeAsync(500);
        expect(fetch).not.toHaveBeenCalled();

        (popup as unknown as { closed: boolean }).closed = true;
        await vi.advanceTimersByTimeAsync(500);

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(useSessionStore.getState().status).toBe("active");
        expect(queryClient.getQueryData(RQKeys.user_me())).toEqual(reconnected);
        expect(setQueryData).toHaveBeenCalledWith(RQKeys.user_me(), reconnected);
        expect(invalidateQueries).toHaveBeenCalledWith();
        expect(setQueryData.mock.invocationCallOrder[0]).toBeLessThan(invalidateQueries.mock.invocationCallOrder[0]);
    });

    it("reste expirée quand la popup se ferme sans connexion", async () => {
        startSessionClock();
        applyUser(user(NOW - 1));
        vi.stubGlobal(
            "fetch",
            vi.fn(() => Promise.resolve(jsonResponse({ status: 401, title: "Unauthorized", type: "/errors/anonymous" }, 401)))
        );
        const popup = fakePopup();
        vi.spyOn(window, "open").mockReturnValue(popup);

        reconnect();
        (popup as unknown as { closed: boolean }).closed = true;
        await vi.advanceTimersByTimeAsync(500);

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(useSessionStore.getState().status).toBe("expired");
    });

    it("abandonne la relecture en cours quand une nouvelle popup s’ouvre", async () => {
        startSessionClock();
        applyUser(user(NOW - 1));
        const fetchMock = vi.fn(
            (request: Request) =>
                new Promise<Response>((_, reject) => request.signal.addEventListener("abort", () => reject(new DOMException("abandon", "AbortError"))))
        );
        vi.stubGlobal("fetch", fetchMock);
        const popup = fakePopup();
        vi.spyOn(window, "open").mockReturnValue(popup);

        reconnect();
        (popup as unknown as { closed: boolean }).closed = true;
        await vi.advanceTimersByTimeAsync(500);
        expect(fetchMock).toHaveBeenCalledTimes(1);

        const second = fakePopup();
        vi.spyOn(window, "open").mockReturnValue(second);
        reconnect();
        await vi.advanceTimersByTimeAsync(0);

        expect(fetchMock.mock.calls[0][0].signal.aborted).toBe(true);
        expect(useSessionStore.getState().status).toBe("expired");
    });
});

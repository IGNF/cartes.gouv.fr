// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CartesUser } from "@/@types/app";
import RQKeys from "@/modules/entrepot/RQKeys";
import { queryClient } from "@/modules/queryClient";
import SymfonyRouting from "@/modules/Routing";
import { useAuthStore } from "@/stores/AuthStore";
import { LOGIN_POPUP_FEATURES, LOGIN_POPUP_NAME, reconnect } from "./reconnect";

const user = { id: "user-1", email: "user@example.test", user_name: "user", roles: ["ROLE_USER"], communities_member: [] } as unknown as CartesUser;

function jsonResponse(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), { status, headers: { "Content-Type": status < 400 ? "application/json" : "application/problem+json" } });
}

function fakePopup() {
    return { closed: false } as Window;
}

describe("reconnect", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        // les URL du front sont relatives, Request (Node) exige une URL absolue
        SymfonyRouting.setBaseUrl("http://localhost");
        queryClient.clear();
        useAuthStore.getState().setSessionExpired(true);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it("ouvre la connexion dans une popup nommée avec le drapeau popup", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(() => Promise.resolve(jsonResponse({ status: 401, title: "Unauthorized", type: "/errors/anonymous" }, 401)))
        );
        const popup = fakePopup();
        const open = vi.spyOn(window, "open").mockReturnValue(popup);

        const done = reconnect();

        expect(open).toHaveBeenCalledWith("http://localhost/login?popup=1", LOGIN_POPUP_NAME, LOGIN_POPUP_FEATURES);
        // la popup se ferme pour ne pas laisser de reconnexion en cours au test suivant
        (popup as { closed: boolean }).closed = true;
        await vi.advanceTimersByTimeAsync(500);
        await done;
    });

    it("se rabat sur une navigation vers le login quand la popup est bloquée", async () => {
        vi.spyOn(window, "open").mockReturnValue(null);
        const assign = vi.fn();
        vi.stubGlobal("location", { href: window.location.href, assign });

        await reconnect();

        expect(assign).toHaveBeenCalledWith("http://localhost/login");
    });

    it("relit l’utilisateur à la fermeture de la popup : cache écrit, session levée, puis invalidation", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(() => Promise.resolve(jsonResponse(user)))
        );
        const setQueryData = vi.spyOn(queryClient, "setQueryData");
        const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries").mockImplementation(() => {
            // l’invalidation doit trouver la requête utilisateur déjà réactivée
            expect(useAuthStore.getState().sessionExpired).toBe(false);
            return Promise.resolve();
        });
        const popup = fakePopup();
        vi.spyOn(window, "open").mockReturnValue(popup);

        const done = reconnect();
        await vi.advanceTimersByTimeAsync(500);
        expect(fetch).not.toHaveBeenCalled();

        (popup as { closed: boolean }).closed = true;
        await vi.advanceTimersByTimeAsync(500);
        await done;

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(queryClient.getQueryData(RQKeys.user_me())).toEqual(user);
        expect(useAuthStore.getState().sessionExpired).toBe(false);
        expect(invalidateQueries).toHaveBeenCalledWith();
        expect(setQueryData.mock.invocationCallOrder[0]).toBeLessThan(invalidateQueries.mock.invocationCallOrder[0]);
    });

    it("ne rouvre pas la popup sur un second clic tant qu’elle est ouverte", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(() => Promise.resolve(jsonResponse(user)))
        );
        const popup = fakePopup();
        const open = vi.spyOn(window, "open").mockReturnValue(popup);

        const first = reconnect();
        const second = reconnect();
        (popup as { closed: boolean }).closed = true;
        await vi.advanceTimersByTimeAsync(500);
        await Promise.all([first, second]);

        expect(open).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledTimes(1);
    });

    it("reste expirée quand la popup se ferme sans connexion", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(() => Promise.resolve(jsonResponse({ status: 401, title: "Unauthorized", type: "/errors/anonymous" }, 401)))
        );
        const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
        const popup = fakePopup();
        vi.spyOn(window, "open").mockReturnValue(popup);

        const done = reconnect();
        (popup as { closed: boolean }).closed = true;
        await vi.advanceTimersByTimeAsync(500);
        await done;

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(useAuthStore.getState().sessionExpired).toBe(true);
        expect(invalidateQueries).not.toHaveBeenCalled();
    });
});

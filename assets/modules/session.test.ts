// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CartesUser } from "@/@types/app";
import RQKeys from "@/modules/entrepot/RQKeys";
import { queryClient } from "@/modules/queryClient";
import SymfonyRouting from "@/modules/Routing";
import { useSessionStore } from "@/stores/SessionStore";
import { LOGIN_POPUP_FEATURES, LOGIN_POPUP_NAME, reconnect } from "./session";

const user = { _id: "user-1", email: "user@example.test", user_name: "user", roles: ["ROLE_USER"], session_expires_at: 1_700_000_000 } as CartesUser;

function jsonResponse(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), { status, headers: { "Content-Type": status < 400 ? "application/json" : "application/problem+json" } });
}

function fakePopup() {
    return { closed: false } as Window;
}

describe("session", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        // les URL du front sont relatives, Request (Node) exige une URL absolue
        SymfonyRouting.setBaseUrl("http://localhost");
        queryClient.clear();
        useSessionStore.setState({ status: "expired" });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it("ouvre la connexion dans une popup nommée avec le drapeau popup", () => {
        const open = vi.spyOn(window, "open").mockReturnValue(fakePopup());

        void reconnect();

        expect(open).toHaveBeenCalledWith("http://localhost/login?popup=1", LOGIN_POPUP_NAME, LOGIN_POPUP_FEATURES);
    });

    it("se rabat sur une navigation vers le login quand la popup est bloquée", async () => {
        vi.spyOn(window, "open").mockReturnValue(null);
        const assign = vi.fn();
        vi.stubGlobal("location", { href: window.location.href, assign });

        await reconnect();

        expect(assign).toHaveBeenCalledWith("http://localhost/login");
    });

    it("relit l’utilisateur à la fermeture de la popup et réactive la session, cache écrit avant invalidation", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(() => Promise.resolve(jsonResponse(user)))
        );
        const setQueryData = vi.spyOn(queryClient, "setQueryData");
        const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
        const popup = fakePopup();
        vi.spyOn(window, "open").mockReturnValue(popup);

        const done = reconnect();
        await vi.advanceTimersByTimeAsync(500);
        expect(fetch).not.toHaveBeenCalled();

        (popup as { closed: boolean }).closed = true;
        await vi.advanceTimersByTimeAsync(500);
        await done;

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(useSessionStore.getState().status).toBe("active");
        expect(queryClient.getQueryData(RQKeys.user_me())).toEqual(user);
        expect(setQueryData).toHaveBeenCalledWith(RQKeys.user_me(), user);
        expect(invalidateQueries).toHaveBeenCalledWith();
        expect(setQueryData.mock.invocationCallOrder[0]).toBeLessThan(invalidateQueries.mock.invocationCallOrder[0]);
    });

    it("reste expirée quand la popup se ferme sans connexion", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(() => Promise.resolve(jsonResponse({ status: 401, title: "Unauthorized", type: "/errors/anonymous" }, 401)))
        );
        const popup = fakePopup();
        vi.spyOn(window, "open").mockReturnValue(popup);

        const done = reconnect();
        (popup as { closed: boolean }).closed = true;
        await vi.advanceTimersByTimeAsync(500);
        await done;

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(useSessionStore.getState().status).toBe("expired");
    });
});

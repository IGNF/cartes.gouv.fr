import { afterEach, describe, expect, it, vi } from "vitest";

import { useAuthStore } from "../stores/AuthStore";
import { ApiError, ApiErrorType, jsonFetch } from "./jsonFetch";

function stubFetch(response: Response) {
    const fetchMock = vi.fn((_request: Request) => Promise.resolve(response));
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
}

function problem(body: object, status: number) {
    return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/problem+json" } });
}

async function caught(promise: Promise<unknown>): Promise<ApiError> {
    try {
        await promise;
    } catch (error) {
        return error as ApiError;
    }
    throw new Error("la promesse aurait dû échouer");
}

describe("jsonFetch", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        useAuthStore.getState().setSessionExpired(false);
    });

    it("demande du JSON et marque l'appel comme XHR", async () => {
        const fetchMock = stubFetch(new Response("{}", { status: 200 }));

        await jsonFetch("http://localhost/api/test");

        const request = fetchMock.mock.calls[0][0];
        expect(request.headers.get("Accept")).toBe("application/json");
        expect(request.headers.get("X-Requested-With")).toBe("XMLHttpRequest");
    });

    it("expose le corps Problem Details de l'erreur", async () => {
        stubFetch(problem({ status: 409, title: "Conflict", detail: "Nom déjà utilisé", details: { error: "Conflict" } }, 409));

        const error = await caught(jsonFetch("http://localhost/api/test"));

        expect(error).toEqual({ status: 409, title: "Conflict", detail: "Nom déjà utilisé", details: { error: "Conflict" } });
    });

    it("construit l'erreur depuis le statut quand le corps n'est pas du JSON", async () => {
        stubFetch(new Response("<html>Bad Gateway</html>", { status: 502, statusText: "Bad Gateway" }));

        const error = await caught(jsonFetch("http://localhost/api/test"));

        expect(error).toEqual({ status: 502, title: "Bad Gateway" });
    });

    it("signale la session expirée seulement pour le type session-expired", async () => {
        stubFetch(problem({ status: 401, title: "Unauthorized", type: ApiErrorType.ANONYMOUS }, 401));
        await caught(jsonFetch("http://localhost/api/test"));
        expect(useAuthStore.getState().sessionExpired).toBe(false);

        stubFetch(problem({ status: 401, title: "Unauthorized", type: ApiErrorType.SESSION_EXPIRED }, 401));
        await caught(jsonFetch("http://localhost/api/test"));
        expect(useAuthStore.getState().sessionExpired).toBe(true);
    });
});

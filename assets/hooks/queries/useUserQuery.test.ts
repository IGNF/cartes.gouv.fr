// @vitest-environment jsdom
import { QueryObserver } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CartesUser } from "@/@types/app";
import RQKeys from "@/modules/entrepot/RQKeys";
import { queryClient } from "@/modules/queryClient";
import SymfonyRouting from "@/modules/Routing";
import { useSessionStore } from "@/stores/SessionStore";
import { userQueryOptions } from "./useUserQuery";

const user = { _id: "user-1", email: "user@example.test", user_name: "user", roles: ["ROLE_USER"], session_expires_at: Date.now() / 1000 + 3600 } as CartesUser;

describe("userQueryOptions", () => {
    beforeEach(() => {
        SymfonyRouting.setBaseUrl("http://localhost");
        queryClient.clear();
        useSessionStore.setState({ status: "anonymous" });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("n’interroge jamais /api/users/me hors session active, puis une fois dès qu’elle le devient", async () => {
        const fetchMock = vi.fn(() => Promise.resolve(new Response(JSON.stringify(user), { status: 200, headers: { "Content-Type": "application/json" } })));
        vi.stubGlobal("fetch", fetchMock);
        queryClient.setQueryData(RQKeys.user_me(), null);
        const observer = new QueryObserver(queryClient, userQueryOptions("anonymous"));
        const unsubscribe = observer.subscribe(() => {});

        // comme après une reconnexion : tout est invalidé, seule une requête active se relance
        await queryClient.invalidateQueries();
        observer.setOptions(userQueryOptions("expired"));
        expect(fetchMock).not.toHaveBeenCalled();

        observer.setOptions(userQueryOptions("active"));
        await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
        await vi.waitFor(() => expect(queryClient.getQueryData(RQKeys.user_me())).toEqual(user));
        expect(useSessionStore.getState().status).toBe("active");

        unsubscribe();
    });
});

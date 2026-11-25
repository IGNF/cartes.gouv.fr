// @vitest-environment jsdom
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vitest";

import { type DatastoreEndpoint } from "@/@types/app";
import api from "@/entrepot/api";
import RQKeys from "@/modules/entrepot/RQKeys";
import { datastoreEndpointsQueryOptions, freshEndpoints } from "./datastoreEndpointsQueryOptions";

vi.mock("@/entrepot/api", () => ({ default: { datastore: { getEndpoints: vi.fn() } } }));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const persisted = [{ endpoint: { type: "WFS", open: true }, use: 10, quota: 10 }] as unknown as DatastoreEndpoint[];
const fresh = [{ endpoint: { type: "WFS", open: true }, use: 0, quota: 10 }] as unknown as DatastoreEndpoint[];

// cache restauré du localStorage, puis relecture par la page
const render = async (read: () => Promise<DatastoreEndpoint[]>) => {
    vi.mocked(api.datastore.getEndpoints).mockImplementation(read);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(RQKeys.datastore_endpoints("ds"), persisted);
    const seen: (DatastoreEndpoint[] | undefined)[] = [];
    function Probe() {
        seen.push(freshEndpoints(useQuery(datastoreEndpointsQueryOptions("ds"))));
        return null;
    }
    const root = createRoot(document.createElement("div"));
    await act(async () =>
        root.render(
            <QueryClientProvider client={queryClient}>
                <Probe />
            </QueryClientProvider>
        )
    );
    // laisse la relecture aboutir
    await act(async () => new Promise((resolve) => setTimeout(resolve, 0)));
    act(() => root.unmount());
    return seen;
};

describe("freshEndpoints", () => {
    it("ignore la copie persistée tant que la page n’a pas relu les endpoints", async () => {
        const seen = await render(() => Promise.resolve(fresh));
        expect(seen[0]).toBeUndefined();
        expect(seen.at(-1)).toEqual(fresh);
        expect(seen).not.toContain(persisted);
    });

    it("ignore la copie persistée quand la relecture échoue", async () => {
        const seen = await render(() => Promise.reject(new Error("503")));
        expect(seen.every((endpoints) => endpoints === undefined)).toBe(true);
    });
});

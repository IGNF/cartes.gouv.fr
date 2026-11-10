// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DatasheetDetailed, StoredDataStatusEnum } from "@/@types/app";
import api from "@/entrepot/api";
import useUploadIntegrations from "./useUploadIntegrations";

vi.mock("@/entrepot/api", () => ({
    default: { upload: { getIntegration: vi.fn(), advanceIntegration: vi.fn() } },
}));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const upload = (id: string, tags: Record<string, string> = {}) => ({ _id: id, type: "VECTOR", tags: { datasheet_name: "fiche", ...tags } });

const datasheet = {
    name: "fiche",
    upload_list: [
        upload("waiting"),
        upload("failed"),
        upload("generated", { vectordb_id: "sd-generated" }),
        upload("generating", { vectordb_id: "sd-generating" }),
        upload("other-sheet", { datasheet_name: "autre" }),
    ],
    vector_db_list: [
        { _id: "sd-generated", status: StoredDataStatusEnum.GENERATED },
        { _id: "sd-generating", status: StoredDataStatusEnum.GENERATING },
    ],
} as unknown as DatasheetDetailed;

describe("useUploadIntegrations", () => {
    let root: Root;
    let failedIds: Set<string>;

    const render = async (canAdvance: boolean) => {
        const queryClient = new QueryClient();
        function Probe() {
            failedIds = useUploadIntegrations("ds", datasheet, canAdvance);
            return null;
        }
        root = createRoot(document.createElement("div"));
        await act(async () =>
            root.render(
                <QueryClientProvider client={queryClient}>
                    <Probe />
                </QueryClientProvider>
            )
        );
        // laisse les requêtes se résoudre
        await act(async () => new Promise((resolve) => setTimeout(resolve, 0)));
        return () =>
            act(async () =>
                root.render(
                    <QueryClientProvider client={queryClient}>
                        <Probe />
                    </QueryClientProvider>
                )
            );
    };

    beforeEach(() => {
        vi.mocked(api.upload.getIntegration)
            .mockReset()
            .mockImplementation(async (_ds, uploadId) => ({ status: uploadId === "failed" ? "failed" : "waiting" }) as never);
        vi.mocked(api.upload.advanceIntegration)
            .mockReset()
            .mockResolvedValue({} as never);
    });

    afterEach(() => act(() => root.unmount()));

    it("renvoie les livraisons en échec avant le lancement, sans lire celles déjà lancées", async () => {
        await render(false);

        expect([...failedIds]).toEqual(["failed"]);
        expect(
            vi
                .mocked(api.upload.getIntegration)
                .mock.calls.map(([, uploadId]) => uploadId)
                .sort()
        ).toEqual(["failed", "waiting"]);
    });

    it("nettoie une seule fois la livraison dont la donnée stockée est générée", async () => {
        const rerender = await render(true);
        await rerender();

        expect(api.upload.advanceIntegration).toHaveBeenCalledTimes(1);
        expect(api.upload.advanceIntegration).toHaveBeenCalledWith("ds", "generated");
    });

    it("ne nettoie rien sans les droits", async () => {
        await render(false);

        expect(api.upload.advanceIntegration).not.toHaveBeenCalled();
    });
});

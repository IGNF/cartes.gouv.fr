// @vitest-environment jsdom
import { focusManager, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, type PropsWithChildren, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vitest";

import DatasetAddPage from "./DatasetAddPage";

vi.mock("@/i18n", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock("@/components/Layout/Main", () => ({ default: ({ children }: PropsWithChildren) => <>{children}</> }));
// réponse différée, comme sur le réseau : l’état intermédiaire « en attente » est rendu
vi.mock("@/entrepot/api", () => ({
    default: { metadata: { getByDatasheetName: () => new Promise((_resolve, reject) => setTimeout(() => reject({ status: 404 }), 5)) } },
}));

const formMounts = vi.fn();
vi.mock("./DatasetAddForm", () => ({
    default: function DatasetAddFormStub() {
        useEffect(() => {
            formMounts();
        }, []);
        return null;
    },
}));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const flush = () => act(async () => new Promise((resolve) => setTimeout(resolve, 20)));

describe("DatasetAddPage", () => {
    // une fiche sans fiche de métadonnées répond 404 ; le focus de la fenêtre relit la requête
    it("garde le formulaire monté quand la fiche de métadonnées absente est relue", async () => {
        const queryClient = new QueryClient();
        const root = createRoot(document.createElement("div"));
        await act(async () =>
            root.render(
                <QueryClientProvider client={queryClient}>
                    <DatasetAddPage datastoreId="ds" datasheetName="fiche" />
                </QueryClientProvider>
            )
        );
        await flush();
        expect(formMounts).toHaveBeenCalledTimes(1);

        await act(async () => {
            focusManager.setFocused(false);
            focusManager.setFocused(true);
        });
        await flush();

        expect(formMounts).toHaveBeenCalledTimes(1);
        focusManager.setFocused(undefined);
        act(() => root.unmount());
    });
});

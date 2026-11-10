// @vitest-environment jsdom
import { act, type ChangeEvent } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import useDatasetFileUpload from "./useDatasetFileUpload";

vi.mock("@/i18n", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

// chaque envoi reste en attente jusqu’à ce que le test le termine
const pendingUploads: (() => void)[] = [];
vi.mock("@/modules/FileUploader", () => ({
    default: class {
        uploadFile = () => new Promise<void>((resolve) => pendingUploads.push(resolve));
        uploadComplete = (_uuid: string, file: File) => Promise.resolve({ filename: file.name, srid: "EPSG:4326" });
    },
}));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe("useDatasetFileUpload", () => {
    let root: Root;
    let input: HTMLInputElement;
    let hook: ReturnType<typeof useDatasetFileUpload>;
    const onUploadSuccess = vi.fn();

    function Probe() {
        hook = useDatasetFileUpload({ onFileSelected: () => undefined, onUploadSuccess });
        return <input type="file" ref={hook.fileInputRef} />;
    }

    const select = async (file: File | undefined) => {
        Object.defineProperty(input, "files", { value: file ? [file] : [], configurable: true });
        await act(async () => hook.handleFileChange({} as ChangeEvent<HTMLInputElement>));
    };

    beforeEach(async () => {
        pendingUploads.length = 0;
        onUploadSuccess.mockReset();
        const container = document.createElement("div");
        root = createRoot(container);
        await act(async () => root.render(<Probe />));
        input = container.querySelector("input")!;
    });

    afterEach(() => act(() => root.unmount()));

    it("remet l’envoi à zéro quand un fichier refusé remplace un envoi en cours", async () => {
        await select(new File(["{}"], "a.geojson"));
        expect(hook.uploadInProgress).toBe(true);

        await select(new File(["x"], "b.txt"));
        expect(hook.uploadInProgress).toBe(false);
        expect(hook.fileError).toBe("file.extension");
    });

    it("ignore la fin d’un envoi remplacé", async () => {
        await select(new File(["{}"], "a.geojson"));
        await select(new File(["{}"], "b.geojson"));

        await act(async () => pendingUploads[0]());
        expect(onUploadSuccess).not.toHaveBeenCalled();
        expect(hook.uploadInProgress).toBe(true);

        await act(async () => pendingUploads[1]());
        expect(onUploadSuccess).toHaveBeenCalledWith({ srid: "EPSG:4326", uploadPath: "b.geojson" });
        expect(hook.uploadInProgress).toBe(false);
    });
});

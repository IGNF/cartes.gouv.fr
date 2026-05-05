export function copyToClipboard(text: string) {
    return navigator.clipboard.writeText(text);
}

type SaveBlobOptions = {
    fileName: string;
    description?: string;
    mimeType?: string;
    extension?: string;
};

type WindowWithSavePicker = Window & {
    showSaveFilePicker?: (options?: {
        suggestedName?: string;
        excludeAcceptAllOption?: boolean;
        types?: Array<{
            description?: string;
            accept: Record<string, string[]>;
        }>;
    }) => Promise<{
        createWritable: () => Promise<{
            write: (data: Blob) => Promise<void>;
            close: () => Promise<void>;
        }>;
    }>;
};

export async function saveBlob(blob: Blob, options: SaveBlobOptions): Promise<void> {
    const { fileName, description, mimeType, extension } = options;
    const showSaveFilePicker = (window as WindowWithSavePicker).showSaveFilePicker;

    if (typeof showSaveFilePicker === "function") {
        try {
            const pickerTypes =
                mimeType && extension
                    ? [
                          {
                              description: description ?? "Fichier",
                              accept: { [mimeType]: [extension] },
                          },
                      ]
                    : undefined;

            const handle = await showSaveFilePicker({
                suggestedName: fileName,
                types: pickerTypes,
            });

            const writable = await handle.createWritable();
            await writable.write(blob);
            await writable.close();
            return;
        } catch (error) {
            if (error instanceof DOMException && error.name === "AbortError") {
                return;
            }
            // fallback vers téléchargement classique
        }
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 0);
}

import thumbnails from "../data/doc_thumbnail";
import { getFileExtension } from "../utils";

const getFileURI = async (file: File): Promise<string | null> => {
    const fileReader = new FileReader();

    return new Promise((resolve) => {
        fileReader.onerror = () => {
            fileReader.abort();
            console.log("Problem reading file");
            resolve(null);
        };

        fileReader.onload = () => {
            resolve(fileReader.result as string);
        };
        fileReader.readAsDataURL(file);
    });
};

const getThumbnailFromFileName = (fileName?: string) => {
    if (!fileName) {
        return thumbnails.defaut.src;
    }

    const extension = getFileExtension(fileName);

    const thumbnail = extension ? ((thumbnails as Partial<Record<string, typeof thumbnails.defaut>>)?.[extension] ?? thumbnails.defaut) : thumbnails.defaut;
    return thumbnail.src;
};

const getThumbnail = async (file: File): Promise<string | null> => {
    if (file.type.startsWith("image")) {
        const uri = await getFileURI(file);
        return new Promise((resolve) => resolve(uri));
    }

    return new Promise((resolve) => {
        const src = getThumbnailFromFileName(file.name);
        resolve(src);
    });
};

// l’API espaceco redirige toute requête vers une erreur 403 tant que les CGU ne sont pas acceptées
const isTermsNotAcceptedError = (error: unknown): boolean => {
    const { status, detail } = (error ?? {}) as { status?: unknown; detail?: unknown };
    return status === 403 && typeof detail === "string" && detail.includes("CGU");
};

export { getFileURI, getThumbnailFromFileName, getThumbnail, isTermsNotAcceptedError };

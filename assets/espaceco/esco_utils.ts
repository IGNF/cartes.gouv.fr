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

    const thumbnail = extension ? (thumbnails?.[extension] ?? thumbnails.defaut) : thumbnails.defaut;
    return thumbnail.src;
};

const getThumbnail = async (file: File): Promise<string | null> => {
    if (/^image/.test(file.type)) {
        const uri = await getFileURI(file);
        return new Promise((resolve) => resolve(uri));
    }

    return new Promise((resolve) => {
        const src = getThumbnailFromFileName(file.name);
        resolve(src);
    });
};

export { getFileURI, getThumbnailFromFileName, getThumbnail };

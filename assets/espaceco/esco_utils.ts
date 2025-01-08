import thumbnails from "../data/doc_thumbnail.json";
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

const getThumbnailFromFileName = (appRoot: string, fileName?: string) => {
    let src = thumbnails.defaut.src;
    if (!fileName) {
        return src;
    }

    const extension = getFileExtension(fileName);
    if (extension && extension in thumbnails) {
        src = thumbnails[extension].src;
    }
    return `${appRoot}/${src}`;
};

const getThumbnail = async (appRoot: string, file: File): Promise<string | null> => {
    if (/^image/.test(file.type)) {
        const uri = await getFileURI(file);
        return new Promise((resolve) => resolve(uri));
    }

    return new Promise((resolve) => {
        const src = getThumbnailFromFileName(appRoot, file.name);
        resolve(src);
    });
};

export { getFileURI, getThumbnailFromFileName, getThumbnail };

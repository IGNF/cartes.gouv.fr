import { Dispatch, SetStateAction } from "react";

import SymfonyRouting from "../modules/Routing";
import { jsonFetch } from "./jsonFetch";

const DEFAULT_CHUNK_SIZE = 16000000; // 16 MB

type UploadFileResponseType = {
    index: number;
    numBytes: number;
};

export default class FileUploader {
    #_urlUploadChunk = SymfonyRouting.generate("cartesgouvfr_file_uploader_upload_chunk");
    #_urlUploadComplete = SymfonyRouting.generate("cartesgouvfr_file_uploader_upload_complete");
    #_uploadMetaByUuid = new Map<string, { totalChunks: number; fileSize: number; chunkSize: number }>();

    /**
     * Envoie le fichier en morceaux (voir FileUploadController de Symfony)
     */
    uploadFile = async (uuid: string, file: File, setProgressValue?: Dispatch<SetStateAction<number>>, maxChunkSize: number = DEFAULT_CHUNK_SIZE) => {
        const chunkSize = Number.isFinite(maxChunkSize) && maxChunkSize > 0 ? maxChunkSize : DEFAULT_CHUNK_SIZE;
        let numBytes = 0;
        const totalChunks = Math.ceil(file.size / chunkSize);

        const uploadChunk = async (index: number, chunk: Blob) => {
            const formData = new FormData();
            formData.append("uuid", uuid);
            formData.append("index", String(index));
            formData.append("chunk", chunk, `${uuid}_${index}`);

            return jsonFetch<UploadFileResponseType>(
                this.#_urlUploadChunk,
                {
                    method: "POST",
                },
                formData,
                true,
                true
            );
        };

        let index = 1,
            start = 0;

        while (start < file.size) {
            const chunk = file.slice(start, start + chunkSize);

            const response = await uploadChunk(index, chunk);

            numBytes += response.numBytes;
            if (setProgressValue) {
                setProgressValue(numBytes);
            }

            index += 1;
            start += chunkSize;
        }

        this.#_uploadMetaByUuid.set(uuid, { totalChunks, fileSize: file.size, chunkSize });
    };

    /**
     * Déclare la fin du téléversement et demande la reconstitution de tous les morceaux
     *
     * @returns
     */
    uploadComplete = (uuid: string, file: File) => {
        const meta = this.#_uploadMetaByUuid.get(uuid);
        const chunkSize = meta?.chunkSize ?? DEFAULT_CHUNK_SIZE;
        const body = {
            uuid: uuid,
            originalFilename: file.name,
            totalChunks: meta?.totalChunks ?? Math.ceil(file.size / chunkSize),
            fileSize: meta?.fileSize ?? file.size,
        };
        return jsonFetch<{ srid: string; filename: string }>(
            this.#_urlUploadComplete,
            {
                method: "POST",
            },
            body,
            false,
            true
        ).finally(() => {
            this.#_uploadMetaByUuid.delete(uuid);
        });
    };
}

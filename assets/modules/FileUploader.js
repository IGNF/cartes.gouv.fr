import { jsonFetch } from "./jsonFetch";

const DEFAULT_CHUNK_SIZE = 16000000; // 16 MB

export default class FileUploader {
    #_urlUploadChunk = Routing.generate("cartesgouvfr_file_uploader_upload_chunk");
    #_urlUploadComplete = Routing.generate("cartesgouvfr_file_uploader_upload_complete");

    /**
     * Envoie le fichier en morceaux (voir FileUploadController)
     *
     * @param {string} uuid
     * @param {File} file
     * @param {Function} setProgressValue
     * @param {number} maxChunkSize
     * @returns
     */
    uploadFile = async (uuid, file, setProgressValue = undefined, maxChunkSize = DEFAULT_CHUNK_SIZE) => {
        let numBytes = 0;

        const uploadChunk = async (index, chunk) => {
            const chunkFile = new File([chunk], "chunk");

            const formData = new FormData();
            formData.append("uuid", uuid);
            formData.append("index", index);
            formData.append("chunk", chunkFile, `${uuid}_${index}`);

            return jsonFetch(
                this.#_urlUploadChunk,
                {
                    method: "POST",
                    body: formData,
                    headers: {
                        "X-Requested-With": "XMLHttpRequest",
                    },
                },
                true,
                true
            );
            // .then((response) => {
            //     if (!response.ok) {
            //         const text = await response.text();
            //         return { status: "error", msg: text };
            //     } else {
            //         return response.json();
            //     }
            // })
            // .then((data) => {
            //     return { status: "ok", numBytes: data.numBytes };
            // })
            // .catch((err) => {
            //     return { status: "error", msg: err.message };
            // });
        };

        let index = 1,
            start = 0;

        while (start < file.size) {
            const chunk = file.slice(start, start + maxChunkSize);

            let response = await uploadChunk(index, chunk);

            numBytes += response.numBytes;
            if (setProgressValue) {
                setProgressValue(numBytes);
            }

            index += 1;
            start += maxChunkSize;
        }

        // return new Promise((resolve, reject) => {
        //     (async function () {
        //         let index = 1,
        //             start = 0;

        //         while (start < file.size) {
        //             const chunk = file.slice(start, start + maxChunkSize);

        //             let response = await uploadChunk(index, chunk);
        //             if (response.status === "error") {
        //                 reject(new Error(response.msg));
        //             }

        //             numBytes += response.numBytes;
        //             if (setProgressValue) {
        //                 setProgressValue(numBytes);
        //             }

        //             index += 1;
        //             start += maxChunkSize;
        //         }
        //         resolve();
        //     })();
        // });
    };

    /**
     * Déclare la fin du téléversement et demande la reconstitution de tous les morceaux
     *
     * @param {string} uuid
     * @param {File} file
     * @returns
     */
    uploadComplete = (uuid, file) => {
        return jsonFetch(
            this.#_urlUploadComplete,
            {
                method: "POST",
                body: {
                    uuid: uuid,
                    originalFilename: file.name,
                },
            },
            false,
            true
        );
    };
}

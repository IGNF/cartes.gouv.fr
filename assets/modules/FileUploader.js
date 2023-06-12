const DEFAULT_CHUNK_SIZE = 16000000; // 16 MB

export default class FileUploader {
    #_urlUploadChunk = Routing.generate("cartesgouvfr_app_upload_chunk");
    #_urlUploadComplete = Routing.generate("cartesgouvfr_app_upload_complete");

    uploadFile = async (uuid, file, setProgressValue = undefined, maxChunkSize = DEFAULT_CHUNK_SIZE) => {
        let numBytes = 0;

        const uploadChunk = async (index, chunk) => {
            const chunkFile = new File([chunk], "chunk");

            const formData = new FormData();
            formData.append("uuid", uuid);
            formData.append("index", index);
            formData.append("chunk", chunkFile, `${uuid}_${index}`);

            return fetch(this.#_urlUploadChunk, {
                method: "POST",
                body: formData,
            })
                .then(async (response) => {
                    if (!response.ok) {
                        const text = await response.text();
                        return { status: "error", msg: text };
                    } else {
                        return response.json();
                    }
                })
                .then((data) => {
                    return { status: "ok", numBytes: data.numBytes };
                })
                .catch((err) => {
                    return { status: "error", msg: err.message };
                });
        };

        return new Promise((resolve, reject) => {
            (async function () {
                let index = 1,
                    start = 0;

                while (start < file.size) {
                    const chunk = file.slice(start, start + maxChunkSize);

                    let response = await uploadChunk(index, chunk);
                    if (response.status === "error") {
                        reject(new Error(response.msg));
                    }

                    numBytes += response.numBytes;
                    if (setProgressValue) {
                        setProgressValue(numBytes);
                    }

                    index += 1;
                    start += maxChunkSize;
                }
                resolve();
            })();
        });
    };

    uploadComplete = (uuid, file) => {
        const formData = new FormData();
        formData.append("uuid", uuid);
        formData.append("originalFilename", file.name);

        return fetch(this.#_urlUploadComplete, { method: "POST", body: formData }).then(async (response) => {
            if (!response.ok) {
                const text = await response.text();
                throw new Error(text);
            } else return response.json();
        });
    };
}

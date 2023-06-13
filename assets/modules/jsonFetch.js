export class JsonFetchError {
    constructor(status, data = null) {
        this.data = data;
        this.status = status;
    }
}

/**
 * @param {RequestInfo|URL} url
 * @param {RequestInit} params
 * @param {boolean} isFileUpload
 * @param {boolean} isXMLHttpRequest
 * @throws {JsonFetchError} error
 */
export async function jsonFetch(url, params = {}, isFileUpload = false, isXMLHttpRequest = true) {
    return new Promise((resolve, reject) => {
        (async function () {
            let defaultHeaders = {};
            if (!isFileUpload) {
                // Si on reçoit un objet on le convertit en chaine JSON
                if (params?.body && typeof params.body === "object") {
                    params.body = JSON.stringify(params.body);
                }
            }

            defaultHeaders = {
                Accept: "application/json",
            };

            if (isXMLHttpRequest) {
                defaultHeaders["X-Requested-With"] = "XMLHttpRequest";
            }

            params = {
                headers: {
                    ...defaultHeaders,
                    ...params.headers,
                },
                ...params,
            };

            const response = await fetch(url, params);
            if (response.status === 204) {
                resolve(null);
            }
            const data = await response.json();

            if (response.ok) {
                resolve(data);
            } else {
                reject(new JsonFetchError(response.status, data));
            }
        })();
    });
}

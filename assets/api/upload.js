import { jsonFetch } from "../modules/jsonFetch";

/**
 *
 * @param {string} datastoreId
 * @param {FormData|object} formData
 * @returns {Promise}
 */
const add = (datastoreId, formData) => {
    const url = Routing.generate("cartesgouvfr_api_upload_add", { datastoreId });
    return jsonFetch(url, {
        method: "POST",
        body: formData,
    });
};

/**
 *
 * @param {string} datastoreId
 * @param {string} uploadId
 * @param {RequestInit} otherOptions
 * @returns {Promise}
 */
const integrationProgressPing = (datastoreId, uploadId, otherOptions = {}) => {
    const url = Routing.generate("cartesgouvfr_api_upload_integration_progress", { datastoreId, uploadId });
    return jsonFetch(url, {
        method: "GET",
        ...otherOptions,
    });
};

export default {
    add,
    integrationProgressPing,
};
